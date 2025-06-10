
import { useState, useCallback, useRef } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [remainingText, setRemainingText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentWordPosition, setCurrentWordPosition] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  
  // Refs para controle de timers e sincronização
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boundaryCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechStateRef = useRef({ isPlaying: false, isPaused: false, currentWordIndex: 0 });
  const lastBoundaryTimeRef = useRef<number>(0);
  const fallbackActiveRef = useRef(false);

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
    fallbackActiveRef.current = false;
  }, []);

  // Função para detectar dispositivo móvel de forma mais precisa
  const isMobileDevice = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth < 768 || 
           'ontouchstart' in window ||
           navigator.maxTouchPoints > 0;
  }, []);

  // Sistema de fallback aprimorado para sincronização de palavras
  const createWordSyncSystem = useCallback((words: string[], fromPosition: number, onWordBoundary: (word: string, index: number) => void, utterance: SpeechSynthesisUtterance) => {
    let currentWordIndex = 0;
    let boundaryEventsDetected = false;
    const isMobile = isMobileDevice();
    
    console.log(`[WordSync] Inicializando sistema para ${words.length} palavras, posição inicial: ${fromPosition}`);

    // Fallback timer system - mais preciso e adaptativo
    const startFallbackTimer = () => {
      if (fallbackActiveRef.current) return;
      
      fallbackActiveRef.current = true;
      console.log("[WordSync] Iniciando sistema de fallback timer");
      
      // Calcular duração baseada na velocidade e complexidade da palavra
      const calculateWordDuration = (word: string, rate: number) => {
        const baseTime = 500; // tempo base em ms
        const rateMultiplier = 1 / Math.max(rate, 0.5);
        const lengthMultiplier = Math.max(1, word.length / 6);
        const punctuationMultiplier = /[.!?]/.test(word) ? 1.5 : 1;
        
        return baseTime * rateMultiplier * lengthMultiplier * punctuationMultiplier;
      };

      const processNextWord = () => {
        if (!speechStateRef.current.isPlaying || speechStateRef.current.isPaused || currentWordIndex >= words.length) {
          fallbackActiveRef.current = false;
          return;
        }

        const word = words[currentWordIndex];
        const globalIndex = fromPosition + currentWordIndex;
        
        console.log(`[WordSync] Fallback destacando palavra ${globalIndex}: "${word}"`);
        
        // Atualizar posição atual para funcionalidade de pause/resume
        setCurrentWordPosition(globalIndex + 1);
        speechStateRef.current.currentWordIndex = globalIndex;
        
        // Chamar callback de highlight
        onWordBoundary(word, globalIndex);
        
        currentWordIndex++;
        
        // Agendar próxima palavra
        if (currentWordIndex < words.length) {
          const duration = calculateWordDuration(word, utterance.rate || 0.8);
          wordTimerRef.current = setTimeout(processNextWord, duration);
        } else {
          console.log("[WordSync] Fallback timer completado");
          fallbackActiveRef.current = false;
        }
      };

      // Iniciar com delay mínimo
      wordTimerRef.current = setTimeout(processNextWord, 200);
    };

    // Sistema de boundary events aprimorado
    const handleBoundaryEvent = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word') return;
      
      boundaryEventsDetected = true;
      lastBoundaryTimeRef.current = Date.now();
      
      // Parar fallback se boundary events estão funcionando
      if (fallbackActiveRef.current) {
        console.log("[WordSync] Boundary events detectados - parando fallback");
        cleanup();
        fallbackActiveRef.current = false;
      }
      
      // Calcular índice da palavra baseado na posição do caractere
      const charIndex = event.charIndex;
      let wordIndex = 0;
      let charCount = 0;
      
      for (let i = 0; i < words.length; i++) {
        if (charCount <= charIndex && charIndex < charCount + words[i].length) {
          wordIndex = i;
          break;
        }
        charCount += words[i].length + 1; // +1 para espaço
      }
      
      const globalWordIndex = fromPosition + wordIndex;
      currentWordIndex = wordIndex + 1;
      
      console.log(`[WordSync] Boundary event - palavra ${globalWordIndex}: "${words[wordIndex] || ''}"`);
      
      // Atualizar posição para resume
      setCurrentWordPosition(globalWordIndex + 1);
      speechStateRef.current.currentWordIndex = globalWordIndex;
      
      onWordBoundary(words[wordIndex] || '', globalWordIndex);
    };

    // Verificação de saúde do sistema de boundary events
    const startBoundaryHealthCheck = () => {
      if (isMobile) {
        // Em mobile, usar fallback imediatamente
        startFallbackTimer();
        return;
      }

      boundaryCheckTimeoutRef.current = setTimeout(() => {
        if (!boundaryEventsDetected && speechStateRef.current.isPlaying) {
          console.log("[WordSync] Boundary events não funcionando - ativando fallback");
          startFallbackTimer();
        }
      }, 800);
    };

    return {
      handleBoundaryEvent,
      startHealthCheck: startBoundaryHealthCheck,
      cleanup: () => {
        cleanup();
        boundaryEventsDetected = false;
        currentWordIndex = 0;
      }
    };
  }, [cleanup, isMobileDevice]);

  const playText = useCallback(async (text: string, lang: string = "en-US", fromPosition: number = 0, onWordBoundary?: (word: string, index: number) => void) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis não suportado");
      return;
    }

    console.log("[Audio] Iniciando playText:", {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      isPlaying,
      isPaused,
      fromPosition
    });

    // Reset estado parado quando iniciando nova reprodução
    setIsStopped(false);
    cleanup();

    // Parar qualquer fala atual e aguardar limpeza completa
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos máximo
      while (speechSynthesis.speaking && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("[Audio] Limpeza completa após cancel:", {
        speaking: speechSynthesis.speaking,
        attempts
      });
    }

    // Preparar texto e palavras
    const words = text.split(' ').filter(word => word.trim().length > 0);
    const textToPlay = words.slice(fromPosition).join(' ');
    
    if (!textToPlay.trim()) {
      console.warn("Nenhum texto para reproduzir");
      return;
    }
    
    // Armazenar estado atual
    setCurrentWordPosition(fromPosition);
    setCurrentText(text);
    setRemainingText(textToPlay);

    // Criar utterance com configurações otimizadas
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = lang;
    utterance.rate = 0.85; // Velocidade ligeiramente mais lenta para melhor sincronização
    utterance.pitch = 0.9;
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);

    // Selecionar voz americana preferencialmente
    const voices = speechSynthesis.getVoices();
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

    // Configurar sistema de sincronização se callback fornecido
    if (onWordBoundary) {
      const syncSystem = createWordSyncSystem(words, fromPosition, onWordBoundary, utterance);
      
      utterance.onboundary = syncSystem.handleBoundaryEvent;
      
      utterance.onstart = () => {
        console.log("[Audio] Fala iniciada");
        setIsPlaying(true);
        setIsPaused(false);
        speechStateRef.current.isPlaying = true;
        speechStateRef.current.isPaused = false;
        speechStateRef.current.currentWordIndex = fromPosition;
        
        // Trigger primeira palavra imediatamente
        if (words.length > 0) {
          onWordBoundary(words[0] || '', fromPosition);
        }
        
        // Iniciar sistema de verificação
        syncSystem.startHealthCheck();
      };
      
      utterance.onend = () => {
        console.log("[Audio] Fala finalizada");
        syncSystem.cleanup();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
        
        // Verificação adicional de limpeza
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            console.warn("[Audio] Speech ainda ativo após onend - forçando cancel");
            speechSynthesis.cancel();
          }
        }, 100);
      };
      
      utterance.onerror = (event) => {
        console.error("[Audio] Erro na síntese:", event);
        syncSystem.cleanup();
        
        if (event.error === 'interrupted') {
          console.log("[Audio] Interrupção esperada durante pause/resume");
          return;
        }
        
        if (event.error === 'canceled') {
          console.log("[Audio] Fala cancelada");
        } else if (event.error === 'not-allowed') {
          console.log("[Audio] Fala não permitida - interação do usuário necessária");
        } else if (event.error === 'network') {
          console.log("[Audio] Erro de rede na síntese");
          return; // Não limpar estado completamente em erros de rede
        }
        
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
      };
    } else {
      // Configuração simples sem sincronização
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        speechStateRef.current.isPlaying = true;
        speechStateRef.current.isPaused = false;
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
      };
      
      utterance.onerror = (event) => {
        console.error("[Audio] Erro na síntese:", event);
        if (event.error !== 'interrupted') {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
          speechStateRef.current.isPlaying = false;
          speechStateRef.current.isPaused = false;
        }
      };
    }

    // Função para iniciar fala com tratamento de erro
    const startSpeech = () => {
      try {
        if (!speechSynthesis) {
          throw new Error("speechSynthesis não disponível");
        }
        
        if (speechSynthesis.speaking) {
          console.log("[Audio] speechSynthesis ocupado, cancelando anterior");
          speechSynthesis.cancel();
          setTimeout(() => {
            if (!speechSynthesis.speaking) {
              speechSynthesis.speak(utterance);
            }
          }, 200);
        } else {
          speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error("[Audio] Erro ao iniciar síntese:", error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
        cleanup();
      }
    };

    // Aguardar carregamento de vozes se necessário
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
        
        startSpeech();
        speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      };
      
      speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      
      cleanupTimeoutRef.current = setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        startSpeech();
      }, 3000);
    } else {
      startSpeech();
    }
  }, [cleanup, createWordSyncSystem, isPlaying, isPaused]);

  const pauseAudio = useCallback(() => {
    console.log("[Audio] pauseAudio chamado:", {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      isPlaying,
      isPaused,
      currentWordPosition
    });
    
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      try {
        const supportsNativePause = !isMobileDevice();
        
        if (supportsNativePause) {
          speechSynthesis.pause();
          
          setTimeout(() => {
            if (speechSynthesis.paused && speechSynthesis.speaking) {
              setIsPaused(true);
              setIsPlaying(false);
              speechStateRef.current.isPaused = true;
              speechStateRef.current.isPlaying = false;
              console.log("[Audio] Pause nativo bem-sucedido na posição:", currentWordPosition);
            } else {
              console.log("[Audio] Pause nativo falhou, usando cancel com tracking");
              speechSynthesis.cancel();
              setIsPaused(true);
              setIsPlaying(false);
              speechStateRef.current.isPaused = true;
              speechStateRef.current.isPlaying = false;
            }
          }, 150);
        } else {
          console.log("[Audio] Dispositivo móvel - usando cancel com tracking");
          speechSynthesis.cancel();
          setIsPaused(true);
          setIsPlaying(false);
          speechStateRef.current.isPaused = true;
          speechStateRef.current.isPlaying = false;
        }
        
      } catch (error) {
        console.warn("[Audio] Erro ao pausar:", error);
        try {
          speechSynthesis.cancel();
        } catch (cancelError) {
          console.warn("[Audio] Erro ao cancelar:", cancelError);
        }
        setIsPaused(true);
        setIsPlaying(false);
        speechStateRef.current.isPaused = true;
        speechStateRef.current.isPlaying = false;
      }
    } else if (speechSynthesis.speaking && speechSynthesis.paused) {
      setIsPaused(true);
      setIsPlaying(false);
      speechStateRef.current.isPaused = true;
      speechStateRef.current.isPlaying = false;
      console.log("[Audio] Já estava pausado");
    }
  }, [currentWordPosition, isMobileDevice]);

  const resumeAudio = useCallback(() => {
    console.log("[Audio] resumeAudio chamado:", {
      paused: speechSynthesis.paused,
      speaking: speechSynthesis.speaking,
      pending: speechSynthesis.pending,
      currentWordPosition,
      hasUtterance: !!currentUtterance,
      isPaused,
      isPlaying,
      isStopped
    });
    
    if (currentUtterance && isPaused && !isStopped) {
      try {
        if (speechSynthesis.speaking) {
          if (speechSynthesis.paused) {
            console.log("[Audio] Resumindo fala pausada...");
            speechSynthesis.resume();
            
            setTimeout(() => {
              if (speechSynthesis.speaking && !speechSynthesis.paused) {
                setIsPaused(false);
                setIsPlaying(true);
                speechStateRef.current.isPaused = false;
                speechStateRef.current.isPlaying = true;
                console.log("[Audio] Resume bem-sucedido da posição:", currentWordPosition);
              } else {
                console.warn("[Audio] Resume falhou - fala ainda pausada ou parada");
              }
            }, 150);
            
            return true;
          } else {
            console.log("[Audio] Fala aparenta estar executando - sincronizando estados");
            setIsPaused(false);
            setIsPlaying(true);
            speechStateRef.current.isPaused = false;
            speechStateRef.current.isPlaying = true;
            return true;
          }
        } else {
          console.log("[Audio] Fala foi interrompida, precisa reiniciar da posição:", currentWordPosition);
          setIsPaused(false);
          setIsPlaying(false);
          setCurrentUtterance(null);
          speechStateRef.current.isPaused = false;
          speechStateRef.current.isPlaying = false;
          return false;
        }
      } catch (error) {
        console.error("[Audio] Erro no resumeAudio:", error);
        setIsPaused(false);
        setIsPlaying(false);
        speechStateRef.current.isPaused = false;
        speechStateRef.current.isPlaying = false;
        return false;
      }
    } else {
      console.warn("[Audio] Não é possível resumir - estado inválido:", {
        hasUtterance: !!currentUtterance,
        isPaused,
        isPlaying,
        isStopped
      });
      return false;
    }
  }, [currentUtterance, isPaused, isPlaying, currentWordPosition, isStopped]);

  const stopAudio = useCallback(() => {
    console.log("[Audio] stopAudio chamado - reset completo");
    cleanup();
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    setCurrentText("");
    setRemainingText("");
    setCurrentWordPosition(0);
    setIsStopped(true);
    speechStateRef.current.isPlaying = false;
    speechStateRef.current.isPaused = false;
    speechStateRef.current.currentWordIndex = 0;
  }, [cleanup]);

  const cleanupOnUnmount = useCallback(() => {
    console.log("[Audio] Limpeza no unmount");
    cleanup();
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    setCurrentText("");
    setRemainingText("");
    setCurrentWordPosition(0);
    setIsStopped(true);
    speechStateRef.current.isPlaying = false;
    speechStateRef.current.isPaused = false;
    speechStateRef.current.currentWordIndex = 0;
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
    currentUtterance,
    currentWordPosition,
    isStopped,
    cleanupOnUnmount
  };
}
