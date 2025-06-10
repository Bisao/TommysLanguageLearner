/**
 * Hook para Leitura Guiada - Gerenciamento de Estado
 * 
 * Este hook centraliza todo o gerenciamento de estado da leitura guiada,
 * fornecendo uma interface limpa e consistente para os componentes.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ReadingGuide, ReadingGuideState, PronunciationFeedback } from '@/lib/reading-guide';
import { WordStyleManager } from '@/lib/word-styling';
import { useAudio } from './use-audio';
import { useSpeechRecognition } from './use-speech-recognition';

export interface UseReadingGuideReturn {
  // Estado principal
  state: ReadingGuideState;
  
  // Gerenciadores
  readingGuide: ReadingGuide;
  styleManager: WordStyleManager;
  
  // Controles de áudio
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  audioIsPlaying: boolean;
  
  // Controles de reconhecimento de voz
  isListening: boolean;
  transcript: string;
  confidence: number;
  
  // Estados adicionais
  audioFinished: boolean;
  showCompletionMessage: boolean;
  isAnalyzing: boolean;
  lastTranscriptWords: string[];
  
  // Ações
  startGuidedReading: (fromPosition?: number) => void;
  handlePlayPause: () => void;
  resetLesson: () => void;
  handleWordClick: (word: string, index: number) => void;
  setReadingMode: (mode: 'guided' | 'practice') => void;
  startListening: () => void;
  stopListening: () => void;
  
  // Utilitários
  completeLesson: () => void;
  initializeText: (title: string, text: string) => void;
}

export function useReadingGuide(onComplete?: () => void): UseReadingGuideReturn {
  // Estados locais
  const [readingGuide] = useState(() => new ReadingGuide());
  const [styleManager] = useState(() => new WordStyleManager());
  const [audioFinished, setAudioFinished] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastTranscriptWords, setLastTranscriptWords] = useState<string[]>([]);
  const [pendingPause, setPendingPause] = useState(false);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  
  // Estado principal da leitura guiada
  const [state, setState] = useState<ReadingGuideState>(() => readingGuide.getState());
  
  // Hooks de áudio e reconhecimento de voz
  const { 
    playText, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    isPlaying: audioIsPlaying, 
    isPaused,
    isStopped
  } = useAudio();
  
  const { 
    startListening, 
    stopListening, 
    transcript,
    confidence,
    resetTranscript,
    isSupported: speechRecognitionSupported 
  } = useSpeechRecognition();

  // Refs para controle avançado
  const isPlayingRef = useRef(false);
  
  /**
   * Sincroniza estado local com o ReadingGuide
   */
  const syncState = useCallback(() => {
    const newState = readingGuide.getState();
    setState(newState);
    styleManager.updateState(newState.readingMode, audioIsPlaying);
  }, [readingGuide, styleManager, audioIsPlaying]);

  /**
   * Atualiza estado da leitura guiada
   */
  const updateState = useCallback((updates: Partial<ReadingGuideState>) => {
    readingGuide.updateState(updates);
    syncState();
  }, [readingGuide, syncState]);

  /**
   * Inicializa o texto para leitura
   */
  const initializeText = useCallback((title: string, text: string) => {
    readingGuide.initialize(title, text);
    syncState();
    console.log('[useReadingGuide] Texto inicializado');
  }, [readingGuide, syncState]);

  /**
   * Inicia a leitura guiada
   */
  const startGuidedReading = useCallback((fromPosition: number = 0) => {
    if (audioIsPlaying && !isPaused) {
      console.log('[useReadingGuide] Reprodução já ativa - ignorando nova chamada');
      return;
    }
    
    console.log(`[useReadingGuide] Iniciando leitura guiada da posição ${fromPosition}`);
    setPendingPause(false);
    
    const wordInfo = readingGuide.getWordInfo();
    const fullText = `${wordInfo.titleWords.join(' ')}. ${wordInfo.textWords.join(' ')}`;
    
    playText(fullText, 'en-US', fromPosition, (word: string, wordIndex: number) => {
      console.log(`[useReadingGuide] Destacando palavra ${wordIndex}: "${word}"`);
      
      readingGuide.setCurrentWord(wordIndex);
      syncState();
      
      // Scroll para a palavra atual
      setTimeout(() => {
        const wordElement = document.querySelector(`[data-word-index="${wordIndex}"]`);
        if (wordElement) {
          wordElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 50);
      
      // Verificar pausa pendente
      if (pendingPause) {
        console.log(`[useReadingGuide] Executando pausa suave após palavra ${wordIndex}`);
        setTimeout(() => {
          pauseAudio();
          setPendingPause(false);
          updateState({ isPlaying: false });
        }, 300);
      }
    });
    
    updateState({ isPlaying: true });
    isPlayingRef.current = true;
  }, [readingGuide, audioIsPlaying, isPaused, playText, pauseAudio, syncState, updateState, pendingPause]);

  /**
   * Controla play/pause da leitura
   */
  const handlePlayPause = useCallback(() => {
    const currentState = readingGuide.getState();
    console.log('[useReadingGuide] Play/Pause acionado:', {
      isPlaying: audioIsPlaying,
      isPaused,
      isStopped,
      readingMode: currentState.readingMode,
      lastCompletedWordIndex: currentState.lastCompletedWordIndex
    });

    if (audioIsPlaying) {
      if (currentState.readingMode === 'guided' && speechSynthesis.speaking) {
        console.log('[useReadingGuide] Solicitando pausa suave');
        setPendingPause(true);
      } else {
        console.log('[useReadingGuide] Pausando imediatamente');
        pauseAudio();
        updateState({ isPlaying: false });
      }
    } else if (isPaused && !isStopped && currentState.readingMode === 'guided') {
      const resumePosition = Math.max(0, currentState.lastCompletedWordIndex + 1);
      console.log(`[useReadingGuide] Retomando da palavra ${resumePosition}`);
      
      const resumed = resumeAudio();
      
      if (resumed) {
        updateState({ isPlaying: true });
      } else {
        console.log(`[useReadingGuide] Resume falhou - continuando da posição ${resumePosition}`);
        updateState({ currentWordIndex: resumePosition });
        startGuidedReading(resumePosition);
      }
    } else {
      const startPosition = isStopped ? 0 : Math.max(0, currentState.lastCompletedWordIndex >= 0 ? currentState.lastCompletedWordIndex + 1 : 0);
      console.log(`[useReadingGuide] Iniciando nova reprodução da posição ${startPosition}`);
      
      updateState({
        currentWordIndex: startPosition,
        isPlaying: true
      });
      startGuidedReading(startPosition);
    }
  }, [readingGuide, audioIsPlaying, isPaused, isStopped, pauseAudio, resumeAudio, startGuidedReading, updateState]);

  /**
   * Reinicia a lição
   */
  const resetLesson = useCallback(() => {
    stopAudio();
    readingGuide.reset();
    
    // Reset estados locais
    setAudioFinished(false);
    setShowCompletionMessage(false);
    setPendingPause(false);
    setLastProcessedTranscript('');
    setIsAnalyzing(false);
    setLastTranscriptWords([]);
    
    stopListening();
    resetTranscript();
    
    syncState();
    console.log('[useReadingGuide] Reset completo realizado');
  }, [stopAudio, readingGuide, stopListening, resetTranscript, syncState]);

  /**
   * Manipula clique em uma palavra
   */
  const handleWordClick = useCallback((word: string, index: number) => {
    console.log(`[useReadingGuide] Palavra clicada: "${word}" (índice ${index})`);
    
    const currentState = readingGuide.getState();
    
    if (currentState.readingMode === 'guided') {
      if (audioIsPlaying) {
        pauseAudio();
        updateState({ isPlaying: false });
      }
      
      updateState({ currentWordIndex: index });
      startGuidedReading(index);
    } else if (currentState.readingMode === 'practice') {
      updateState({ currentWordIndex: index });
      
      if (speechRecognitionSupported) {
        startListening();
        updateState({ isListening: true });
      }
    }
  }, [readingGuide, audioIsPlaying, pauseAudio, startGuidedReading, startListening, speechRecognitionSupported, updateState]);

  /**
   * Define o modo de leitura
   */
  const setReadingMode = useCallback((mode: 'guided' | 'practice') => {
    console.log(`[useReadingGuide] Mudando para modo: ${mode}`);
    
    stopAudio();
    stopListening();
    resetTranscript();
    
    updateState({
      readingMode: mode,
      isPlaying: false,
      currentWordIndex: -1
    });
  }, [stopAudio, stopListening, resetTranscript, updateState]);

  /**
   * Completa a lição
   */
  const completeLesson = useCallback(() => {
    updateState({ readingProgress: 100 });
    setTimeout(() => {
      onComplete?.();
    }, 1500);
  }, [updateState, onComplete]);

  // Sincronizar estado de reprodução
  useEffect(() => {
    updateState({ isPlaying: audioIsPlaying });
    isPlayingRef.current = audioIsPlaying;
  }, [audioIsPlaying, updateState]);

  // Verificar conclusão automática
  useEffect(() => {
    if (readingGuide.isReadingComplete() && !showCompletionMessage) {
      console.log('[useReadingGuide] Leitura completada automaticamente');
      setAudioFinished(true);
      setShowCompletionMessage(true);
      
      const timer = setTimeout(() => {
        completeLesson();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.completedWords, readingGuide, showCompletionMessage, completeLesson]);

  return {
    // Estado principal
    state,
    
    // Gerenciadores
    readingGuide,
    styleManager,
    
    // Controles de áudio
    isPlaying: audioIsPlaying,
    isPaused,
    isStopped,
    audioIsPlaying,
    
    // Controles de reconhecimento de voz
    isListening: state.isListening || false,
    transcript,
    confidence,
    
    // Estados adicionais
    audioFinished,
    showCompletionMessage,
    isAnalyzing,
    lastTranscriptWords,
    
    // Ações
    startGuidedReading,
    handlePlayPause,
    resetLesson,
    handleWordClick,
    setReadingMode,
    startListening,
    stopListening,
    
    // Utilitários
    completeLesson,
    initializeText
  };
}