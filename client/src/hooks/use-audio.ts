
import { useState, useCallback, useRef } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [remainingText, setRemainingText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boundaryCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    if (boundaryCheckTimeoutRef.current) {
      clearTimeout(boundaryCheckTimeoutRef.current);
      boundaryCheckTimeoutRef.current = null;
    }
  }, []);

  const playText = useCallback(async (text: string, lang: string = "en-US", fromPosition: number = 0, onWordBoundary?: (word: string, index: number) => void) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    console.log("playText called - current state:", {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      isPlaying,
      isPaused
    });

    // Limpar qualquer timer anterior
    cleanup();

    // Stop any currently playing speech and wait for it to complete
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      
      // Aguardar até que o speechSynthesis pare completamente
      let attempts = 0;
      const maxAttempts = 30; // máximo 3 segundos
      while (speechSynthesis.speaking && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Aguardar um pouco mais para garantir que está totalmente limpo
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("After cancel - speechSynthesis state:", {
        speaking: speechSynthesis.speaking,
        paused: speechSynthesis.paused,
        attempts
      });
    }

    // Split text into words to track position
    const words = text.split(' ').filter(word => word.trim().length > 0);
    const textToPlay = words.slice(fromPosition).join(' ');
    
    if (!textToPlay.trim()) {
      console.warn("No text to play");
      return;
    }
    
    setCurrentText(text);
    setRemainingText(textToPlay);

    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);

    // Detectar dispositivo móvel de forma mais robusta
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth < 768 || 
                     'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0;

    // Try to select appropriate voice
    const voices = speechSynthesis.getVoices();
    
    // Always prioritize American English voice for Professor Tommy
    const americanMaleVoice = voices.find(voice => 
      voice.lang.includes('en-US') && 
      (voice.name.toLowerCase().includes('male') || 
       voice.name.toLowerCase().includes('david') ||
       voice.name.toLowerCase().includes('mark') ||
       voice.name.toLowerCase().includes('alex') ||
       voice.name.toLowerCase().includes('daniel') ||
       voice.name.toLowerCase().includes('fred') ||
       voice.name.toLowerCase().includes('paul') ||
       voice.name.toLowerCase().includes('jorge'))
    );
    
    const americanVoice = voices.find(voice => voice.lang.includes('en-US'));
    
    if (americanMaleVoice) {
      utterance.voice = americanMaleVoice;
    } else if (americanVoice) {
      utterance.voice = americanVoice;
    }

    // Sistema de sincronização PERFEITA entre voz e highlight
    if (onWordBoundary) {
      let currentWordIndex = 0;
      let boundaryEventsWorking = false;
      
      console.log(`Setting up word boundary sync - Words: ${words.length}`);
      
      // Timer fallback para sincronização
      const startWordTimer = () => {
        console.log("Starting word timer fallback for sync");
        const baseWordDuration = 600; // Duração base mais conservadora
        const rateFactor = 1 / (utterance.rate || 0.8);
        const adjustedWordDuration = baseWordDuration * rateFactor;
        
        wordTimerRef.current = setInterval(() => {
          if (currentWordIndex < words.length && !speechSynthesis.paused && speechSynthesis.speaking) {
            const globalWordIndex = fromPosition + currentWordIndex;
            const wordToHighlight = words[currentWordIndex] || '';
            console.log(`Timer highlighting word ${globalWordIndex}: "${wordToHighlight}"`);
            onWordBoundary(wordToHighlight, globalWordIndex);
            currentWordIndex++;
          } else if (currentWordIndex >= words.length || !speechSynthesis.speaking) {
            console.log("Timer completed or speech stopped");
            if (wordTimerRef.current) {
              clearInterval(wordTimerRef.current);
              wordTimerRef.current = null;
            }
          }
        }, adjustedWordDuration);
      };

      // Handler para eventos de boundary do navegador
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') {
          boundaryEventsWorking = true;
          
          // Limpar timeout de verificação se boundary events funcionam
          if (boundaryCheckTimeoutRef.current) {
            clearTimeout(boundaryCheckTimeoutRef.current);
            boundaryCheckTimeoutRef.current = null;
          }
          
          // Limpar timer fallback se boundary events estão funcionando
          if (wordTimerRef.current) {
            console.log("Boundary event detected - clearing timer fallback");
            clearInterval(wordTimerRef.current);
            wordTimerRef.current = null;
          }
          
          // Calcular índice da palavra baseado na posição do caractere
          const charIndex = event.charIndex;
          let wordIndex = 0;
          let charCount = 0;
          
          for (let i = 0; i < words.length; i++) {
            if (charCount + words[i].length >= charIndex) {
              wordIndex = i;
              break;
            }
            charCount += words[i].length + 1; // +1 para espaço
          }
          
          const globalWordIndex = fromPosition + wordIndex;
          currentWordIndex = wordIndex + 1;
          
          console.log(`Boundary event highlighting word ${globalWordIndex}: "${words[wordIndex] || ''}"`);
          onWordBoundary(words[wordIndex] || '', globalWordIndex);
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        console.log("Speech started - triggering first word highlight");
        
        // Disparar primeira palavra imediatamente
        onWordBoundary('', fromPosition);
        currentWordIndex = 0;
        boundaryEventsWorking = false;
        
        // Para mobile, iniciar timer imediatamente
        if (isMobile) {
          startWordTimer();
        } else {
          // Para desktop, aguardar para ver se boundary events funcionam
          const adjustedWordDuration = 600 * (1 / (utterance.rate || 0.8));
          boundaryCheckTimeoutRef.current = setTimeout(() => {
            if (!boundaryEventsWorking && currentWordIndex <= 1 && speechSynthesis.speaking) {
              console.log("Boundary events not working on desktop, starting timer fallback");
              startWordTimer();
            }
          }, adjustedWordDuration * 0.8);
        }
      };
      
      utterance.onend = () => {
        console.log("Speech ended - cleaning up");
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
        cleanup();
        
        // Verificar se o speechSynthesis está realmente parado
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            console.warn("speechSynthesis still speaking after onend - forcing cancel");
            speechSynthesis.cancel();
          }
        }, 100);
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error || event.type, event);
        
        // Tratamento específico para diferentes tipos de erro
        if (event.error === 'interrupted') {
          console.log("Speech interrupted (expected during pause/resume)");
          // NÃO limpar estados durante interrupções esperadas
          return;
        } else if (event.error === 'canceled') {
          console.log("Speech canceled");
          cleanup();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
        } else if (event.error === 'not-allowed') {
          console.log("Speech not allowed - user may need to interact first");
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
        } else if (event.error === 'network') {
          console.log("Network error during speech synthesis");
          // Não limpar completamente em erros de rede, pode ser temporário
          setIsPlaying(false);
        } else {
          console.error("Unexpected speech error:", event.error);
          cleanup();
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
        }
      };
    } else {
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      };
    }

    // Handle voice loading with better error handling
    const speakUtterance = () => {
      try {
        // Verificar se o speechSynthesis está disponível antes de usar
        if (!speechSynthesis) {
          throw new Error("speechSynthesis not available");
        }
        
        // Verificar se já há algo falando
        if (speechSynthesis.speaking) {
          console.log("speechSynthesis busy, canceling previous");
          speechSynthesis.cancel();
          // Aguardar um pouco antes de tentar novamente
          setTimeout(() => {
            if (!speechSynthesis.speaking) {
              speechSynthesis.speak(utterance);
            }
          }, 100);
        } else {
          speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error("Error starting speech synthesis:", error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        cleanup();
      }
    };

    if (voices.length === 0) {
      const voicesChangedHandler = () => {
        const updatedVoices = speechSynthesis.getVoices();
        
        const updatedAmericanMaleVoice = updatedVoices.find(voice => 
          voice.lang.includes('en-US') && 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('mark') ||
           voice.name.toLowerCase().includes('alex') ||
           voice.name.toLowerCase().includes('daniel') ||
           voice.name.toLowerCase().includes('fred') ||
           voice.name.toLowerCase().includes('paul') ||
           voice.name.toLowerCase().includes('jorge'))
        );
        
        const updatedAmericanVoice = updatedVoices.find(voice => voice.lang.includes('en-US'));
        
        if (updatedAmericanMaleVoice) {
          utterance.voice = updatedAmericanMaleVoice;
        } else if (updatedAmericanVoice) {
          utterance.voice = updatedAmericanVoice;
        }
        
        speakUtterance();
        speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      };
      
      speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Timeout de segurança caso voiceschanged não dispare
      cleanupTimeoutRef.current = setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        speakUtterance();
      }, 2000);
    } else {
      speakUtterance();
    }
  }, [cleanup, isPlaying, isPaused]);

  const pauseAudio = useCallback(() => {
    console.log("pauseAudio called - speechSynthesis.speaking:", speechSynthesis.speaking, "speechSynthesis.paused:", speechSynthesis.paused);
    
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      try {
        speechSynthesis.pause();
        
        // Verificar se realmente pausou
        setTimeout(() => {
          if (speechSynthesis.paused || !speechSynthesis.speaking) {
            setIsPaused(true);
            setIsPlaying(false);
            console.log("Speech synthesis paused successfully");
          } else {
            console.warn("Pause failed, using cancel fallback");
            speechSynthesis.cancel();
            setIsPaused(false);
            setIsPlaying(false);
            setCurrentUtterance(null);
          }
        }, 50);
        
      } catch (error) {
        console.warn("Error pausing speech synthesis:", error);
        // Fallback para dispositivos que não suportam pause
        speechSynthesis.cancel();
        setIsPaused(false);
        setIsPlaying(false);
        setCurrentUtterance(null);
      }
    } else if (speechSynthesis.speaking && speechSynthesis.paused) {
      // Já está pausado
      setIsPaused(true);
      setIsPlaying(false);
      console.log("Speech was already paused");
    }
  }, []);

  const resumeAudio = useCallback(() => {
    console.log("resumeAudio called - speechSynthesis state:", {
      paused: speechSynthesis.paused,
      speaking: speechSynthesis.speaking,
      pending: speechSynthesis.pending
    });
    console.log("Hook state:", { currentUtterance: !!currentUtterance, isPaused, isPlaying });
    
    if (currentUtterance && isPaused) {
      try {
        // Primeiro verificar se realmente está pausado
        if (speechSynthesis.speaking) {
          // Se está falando, verificar se está pausado
          if (speechSynthesis.paused) {
            console.log("Speech is properly paused, resuming...");
            speechSynthesis.resume();
            
            // Verificar se realmente retomou
            setTimeout(() => {
              if (speechSynthesis.speaking && !speechSynthesis.paused) {
                setIsPaused(false);
                setIsPlaying(true);
                console.log("Speech synthesis resumed successfully");
              } else {
                console.warn("Resume failed - speech still paused or stopped");
              }
            }, 100);
            
            return true;
          } else {
            // Se está falando mas não pausado, pode ser um problema de sincronização
            console.log("Speech appears to be running but hook thinks it's paused - syncing states");
            setIsPaused(false);
            setIsPlaying(true);
            return true;
          }
        } else {
          // Se não está falando, não pode retomar
          console.log("Speech was completely stopped, cannot resume");
          setIsPaused(false);
          setIsPlaying(false);
          setCurrentUtterance(null);
          return false;
        }
      } catch (error) {
        console.error("Error in resumeAudio:", error);
        setIsPaused(false);
        setIsPlaying(false);
        return false;
      }
    } else {
      console.warn("Cannot resume - invalid state:", {
        hasUtterance: !!currentUtterance,
        isPaused,
        isPlaying
      });
      return false;
    }
  }, [currentUtterance, isPaused, isPlaying]);

  const stopAudio = useCallback(() => {
    console.log("stopAudio called");
    cleanup();
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    setCurrentText("");
    setRemainingText("");
  }, [cleanup]);

  return { 
    playText, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    isPlaying, 
    isPaused,
    currentText,
    remainingText,
    currentUtterance 
  };
}
