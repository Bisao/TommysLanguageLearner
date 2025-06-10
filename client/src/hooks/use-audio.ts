
import { useState, useCallback, useRef } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [remainingText, setRemainingText] = useState("");
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentWordPosition, setCurrentWordPosition] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  
  // Refs para controle avançado
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boundaryCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechStateRef = useRef({ 
    isPlaying: false, 
    isPaused: false, 
    currentWordIndex: 0,
    boundaryEventsWorking: false,
    lastBoundaryTime: 0
  });
  const fallbackActiveRef = useRef(false);
  const sessionIdRef = useRef<string>("");

  // Detecção de dispositivo móvel aprimorada
  const isMobileDevice = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    
    return isMobileUA || isTouchDevice || isSmallScreen;
  }, []);

  const cleanup = useCallback(() => {
    [wordTimerRef, cleanupTimeoutRef, boundaryCheckTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
    fallbackActiveRef.current = false;
    speechStateRef.current.boundaryEventsWorking = false;
  }, []);

  // Sistema de sincronização de palavras robusto
  const createAdvancedWordSync = useCallback((
    words: string[], 
    fromPosition: number, 
    onWordBoundary: (word: string, index: number) => void, 
    utterance: SpeechSynthesisUtterance
  ) => {
    let currentWordIndex = 0;
    let boundaryEventsDetected = false;
    const isMobile = isMobileDevice();
    const sessionId = Date.now().toString();
    sessionIdRef.current = sessionId;
    
    console.log(`[WordSync-${sessionId}] Inicializando sistema avançado - Palavras: ${words.length}, Mobile: ${isMobile}`);

    // Sistema de fallback adaptativo e inteligente
    const createIntelligentFallback = () => {
      if (fallbackActiveRef.current || sessionIdRef.current !== sessionId) return;
      
      fallbackActiveRef.current = true;
      console.log(`[WordSync-${sessionId}] Ativando fallback inteligente`);
      
      const calculateWordDuration = (word: string, rate: number, isLast: boolean) => {
        const baseTime = 400; // tempo base otimizado
        const rateMultiplier = 1 / Math.max(rate, 0.5);
        const lengthMultiplier = Math.max(1, word.length / 5);
        const punctuationMultiplier = /[.!?;:]/.test(word) ? 1.8 : /[,]/.test(word) ? 1.3 : 1;
        const lastWordMultiplier = isLast ? 1.5 : 1;
        
        return baseTime * rateMultiplier * lengthMultiplier * punctuationMultiplier * lastWordMultiplier;
      };

      const processWordSequence = () => {
        if (sessionIdRef.current !== sessionId || !speechStateRef.current.isPlaying || speechStateRef.current.isPaused) {
          fallbackActiveRef.current = false;
          return;
        }

        if (currentWordIndex >= words.length) {
          console.log(`[WordSync-${sessionId}] Fallback concluído - todas as palavras processadas`);
          fallbackActiveRef.current = false;
          return;
        }

        const word = words[currentWordIndex];
        const globalIndex = fromPosition + currentWordIndex;
        const isLastWord = currentWordIndex === words.length - 1;
        
        console.log(`[WordSync-${sessionId}] Fallback destacando palavra ${globalIndex}: "${word}"`);
        
        // Atualizar estados
        setCurrentWordPosition(globalIndex + 1);
        speechStateRef.current.currentWordIndex = globalIndex;
        
        // Callback de highlight
        try {
          onWordBoundary(word, globalIndex);
        } catch (error) {
          console.warn(`[WordSync-${sessionId}] Erro no callback de highlight:`, error);
        }
        
        currentWordIndex++;
        
        // Agendar próxima palavra com duração calculada
        if (currentWordIndex < words.length) {
          const duration = calculateWordDuration(word, utterance.rate || 0.85, isLastWord);
          wordTimerRef.current = setTimeout(processWordSequence, duration);
        } else {
          fallbackActiveRef.current = false;
        }
      };

      // Iniciar com delay adaptativo
      const initialDelay = isMobile ? 300 : 150;
      wordTimerRef.current = setTimeout(processWordSequence, initialDelay);
    };

    // Sistema de boundary events aprimorado
    const handleBoundaryEvent = (event: SpeechSynthesisEvent) => {
      if (event.name !== 'word' || sessionIdRef.current !== sessionId) return;
      
      boundaryEventsDetected = true;
      speechStateRef.current.boundaryEventsWorking = true;
      speechStateRef.current.lastBoundaryTime = Date.now();
      
      // Parar fallback se boundary events funcionam
      if (fallbackActiveRef.current) {
        console.log(`[WordSync-${sessionId}] Boundary events funcionando - parando fallback`);
        cleanup();
        fallbackActiveRef.current = false;
      }
      
      // Calcular índice da palavra com precisão
      const charIndex = event.charIndex || 0;
      let wordIndex = 0;
      let charCount = 0;
      
      for (let i = 0; i < words.length; i++) {
        const wordEndPos = charCount + words[i].length;
        if (charIndex >= charCount && charIndex < wordEndPos + 1) { // +1 para incluir espaço
          wordIndex = i;
          break;
        }
        charCount += words[i].length + 1;
      }
      
      const globalWordIndex = fromPosition + wordIndex;
      currentWordIndex = wordIndex + 1;
      
      console.log(`[WordSync-${sessionId}] Boundary event - palavra ${globalWordIndex}: "${words[wordIndex] || ''}"`);
      
      // Atualizar estados
      setCurrentWordPosition(globalWordIndex + 1);
      speechStateRef.current.currentWordIndex = globalWordIndex;
      
      // Callback seguro
      try {
        onWordBoundary(words[wordIndex] || '', globalWordIndex);
      } catch (error) {
        console.warn(`[WordSync-${sessionId}] Erro no callback boundary:`, error);
      }
    };

    // Sistema de monitoramento de saúde
    const startHealthMonitoring = () => {
      if (isMobile) {
        // Em mobile, usar fallback imediatamente
        console.log(`[WordSync-${sessionId}] Mobile detectado - usando fallback direto`);
        createIntelligentFallback();
        return;
      }

      // Desktop: verificar se boundary events funcionam
      boundaryCheckTimeoutRef.current = setTimeout(() => {
        if (!boundaryEventsDetected && speechStateRef.current.isPlaying && sessionIdRef.current === sessionId) {
          console.log(`[WordSync-${sessionId}] Boundary events não detectados - ativando fallback`);
          createIntelligentFallback();
        }
      }, 1000);
    };

    return {
      handleBoundaryEvent,
      startHealthMonitoring,
      cleanup: () => {
        cleanup();
        boundaryEventsDetected = false;
        currentWordIndex = 0;
        sessionIdRef.current = "";
      }
    };
  }, [cleanup, isMobileDevice]);

  const playText = useCallback(async (
    text: string, 
    lang: string = "en-US", 
    fromPosition: number = 0, 
    onWordBoundary?: (word: string, index: number) => void
  ) => {
    if (!('speechSynthesis' in window)) {
      console.warn("[Audio] Speech synthesis não suportado");
      return;
    }

    const sessionId = Date.now().toString();
    console.log(`[Audio-${sessionId}] Iniciando playText:`, {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      fromPosition,
      textLength: text.length
    });

    // Reset estados
    setIsStopped(false);
    cleanup();

    // Limpeza agressiva do estado anterior
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      
      // Aguardar limpeza completa com timeout
      let attempts = 0;
      const maxAttempts = 30;
      while (speechSynthesis.speaking && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (speechSynthesis.speaking) {
        console.warn(`[Audio-${sessionId}] Forçando cancel após ${attempts} tentativas`);
        speechSynthesis.cancel();
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Preparar texto
    const words = text.split(/\s+/).filter(word => word.trim().length > 0);
    const textToPlay = words.slice(fromPosition).join(' ');
    
    if (!textToPlay.trim()) {
      console.warn(`[Audio-${sessionId}] Nenhum texto válido para reproduzir`);
      return;
    }
    
    // Atualizar estados
    setCurrentWordPosition(fromPosition);
    setCurrentText(text);
    setRemainingText(textToPlay);

    // Criar utterance otimizada
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = lang;
    utterance.rate = 0.85; // Velocidade otimizada para sincronização
    utterance.pitch = 0.95; // Pitch mais natural
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);

    // Selecionar voz americana preferencialmente
    const voices = speechSynthesis.getVoices();
    const selectBestVoice = () => {
      const americanMaleVoices = voices.filter(voice => 
        voice.lang.includes('en-US') && 
        voice.name.toLowerCase().includes('male')
      );
      
      const americanVoices = voices.filter(voice => voice.lang.includes('en-US'));
      const englishVoices = voices.filter(voice => voice.lang.includes('en'));
      
      return americanMaleVoices[0] || americanVoices[0] || englishVoices[0] || voices[0];
    };

    const selectedVoice = selectBestVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`[Audio-${sessionId}] Voz selecionada:`, selectedVoice.name);
    }

    // Configurar sistema de sincronização se necessário
    if (onWordBoundary) {
      const syncSystem = createAdvancedWordSync(words, fromPosition, onWordBoundary, utterance);
      
      utterance.onboundary = syncSystem.handleBoundaryEvent;
      
      utterance.onstart = () => {
        console.log(`[Audio-${sessionId}] Fala iniciada`);
        setIsPlaying(true);
        setIsPaused(false);
        speechStateRef.current.isPlaying = true;
        speechStateRef.current.isPaused = false;
        speechStateRef.current.currentWordIndex = fromPosition;
        
        // Trigger primeira palavra
        try {
          onWordBoundary(words[0] || '', fromPosition);
        } catch (error) {
          console.warn(`[Audio-${sessionId}] Erro no callback inicial:`, error);
        }
        
        // Iniciar monitoramento
        syncSystem.startHealthMonitoring();
      };
      
      utterance.onend = () => {
        console.log(`[Audio-${sessionId}] Fala finalizada`);
        syncSystem.cleanup();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        setCurrentText("");
        setRemainingText("");
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
      };
      
      utterance.onerror = (event) => {
        console.log(`[Audio-${sessionId}] Erro na síntese:`, event.error);
        
        if (event.error === 'interrupted') {
          console.log(`[Audio-${sessionId}] Interrupção esperada durante pause/resume`);
          return; // Não limpar estados em interrupções esperadas
        }
        
        syncSystem.cleanup();
        
        if (event.error === 'canceled') {
          console.log(`[Audio-${sessionId}] Fala cancelada - limpeza suave`);
        } else if (event.error === 'not-allowed') {
          console.log(`[Audio-${sessionId}] Permissão negada - interação necessária`);
        } else {
          console.warn(`[Audio-${sessionId}] Erro inesperado:`, event.error);
        }
        
        // Limpar apenas se não for interrupção esperada
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
        if (event.error !== 'interrupted') {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentUtterance(null);
          speechStateRef.current.isPlaying = false;
          speechStateRef.current.isPaused = false;
        }
      };
    }

    // Iniciar fala com tratamento robusto
    const startSpeech = async () => {
      try {
        if (speechSynthesis.speaking) {
          console.log(`[Audio-${sessionId}] Speech ainda ativo - aguardando...`);
          speechSynthesis.cancel();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`[Audio-${sessionId}] Iniciando reprodução`);
        speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error(`[Audio-${sessionId}] Erro crítico ao iniciar:`, error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        speechStateRef.current.isPlaying = false;
        speechStateRef.current.isPaused = false;
        cleanup();
      }
    };

    // Aguardar vozes se necessário
    if (voices.length === 0) {
      const handleVoicesChanged = () => {
        const updatedVoice = selectBestVoice();
        if (updatedVoice) {
          utterance.voice = updatedVoice;
        }
        startSpeech();
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
      
      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      cleanupTimeoutRef.current = setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        startSpeech();
      }, 2000);
    } else {
      await startSpeech();
    }
  }, [cleanup, createAdvancedWordSync]);

  const pauseAudio = useCallback(() => {
    console.log("[Audio] pauseAudio chamado:", {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      currentWordPosition,
      currentStateIndex: speechStateRef.current.currentWordIndex
    });
    
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      try {
        const isMobile = isMobileDevice();
        
        // Capturar posição atual antes de pausar
        const currentPos = Math.max(currentWordPosition, speechStateRef.current.currentWordIndex);
        setCurrentWordPosition(currentPos);
        
        if (isMobile) {
          console.log(`[Audio] Dispositivo móvel - pausando na posição ${currentPos}`);
          speechSynthesis.cancel();
          setIsPaused(true);
          setIsPlaying(false);
          speechStateRef.current.isPaused = true;
          speechStateRef.current.isPlaying = false;
        } else {
          speechSynthesis.pause();
          
          setTimeout(() => {
            if (speechSynthesis.paused && speechSynthesis.speaking) {
              setIsPaused(true);
              setIsPlaying(false);
              speechStateRef.current.isPaused = true;
              speechStateRef.current.isPlaying = false;
              console.log(`[Audio] Pause nativo bem-sucedido na posição ${currentPos}`);
            } else {
              console.log(`[Audio] Pause falhou - usando fallback na posição ${currentPos}`);
              speechSynthesis.cancel();
              setIsPaused(true);
              setIsPlaying(false);
              speechStateRef.current.isPaused = true;
              speechStateRef.current.isPlaying = false;
            }
          }, 100);
        }
        
      } catch (error) {
        console.warn("[Audio] Erro ao pausar:", error);
        const currentPos = Math.max(currentWordPosition, speechStateRef.current.currentWordIndex);
        setCurrentWordPosition(currentPos);
        speechSynthesis.cancel();
        setIsPaused(true);
        setIsPlaying(false);
        speechStateRef.current.isPaused = true;
        speechStateRef.current.isPlaying = false;
      }
    }
  }, [currentWordPosition, isMobileDevice]);

  const resumeAudio = useCallback(() => {
    console.log("[Audio] resumeAudio chamado:", {
      isPaused,
      hasUtterance: !!currentUtterance,
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      currentWordPosition,
      currentStateIndex: speechStateRef.current.currentWordIndex
    });
    
    if (currentUtterance && isPaused && !isStopped) {
      try {
        if (speechSynthesis.speaking && speechSynthesis.paused) {
          speechSynthesis.resume();
          
          setTimeout(() => {
            if (speechSynthesis.speaking && !speechSynthesis.paused) {
              setIsPaused(false);
              setIsPlaying(true);
              speechStateRef.current.isPaused = false;
              speechStateRef.current.isPlaying = true;
              
              // Manter posição atual para continuidade do tracking
              const resumePos = Math.max(currentWordPosition, speechStateRef.current.currentWordIndex);
              console.log(`[Audio] Resume bem-sucedido da posição ${resumePos}`);
            }
          }, 100);
          
          return true;
        } else {
          console.log("[Audio] Speech foi interrompido - não é possível resumir nativamente");
          return false;
        }
      } catch (error) {
        console.error("[Audio] Erro no resume:", error);
        return false;
      }
    }
    
    return false;
  }, [currentUtterance, isPaused, isStopped, currentWordPosition]);

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
