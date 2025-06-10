/**
 * Componente de Leitura Guiada Refatorado
 * 
 * Sistema modular e robusto para leitura guiada com detecção de linking sounds,
 * gerenciamento de estado centralizado e interface limpa.
 */

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  VolumeX, 
  RotateCcw,
  Headphones,
  Mic,
  MicOff,
  CheckCircle2,
  Target,
  Sparkles
} from "lucide-react";
import { ReadingGuide } from "@/lib/reading-guide";
import { WordStyleManager } from "@/lib/word-styling";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface ReadingLessonProps {
  title: string;
  text: string;
  onComplete: () => void;
  onControlsReady?: (controls: React.ReactNode) => void;
}

export default function ReadingLessonRefactored({ 
  title, 
  text, 
  onComplete, 
  onControlsReady 
}: ReadingLessonProps) {
  // Instanciar gerenciadores
  const readingGuide = useMemo(() => new ReadingGuide(), []);
  const styleManager = useMemo(() => new WordStyleManager(), []);

  // Hooks para áudio e reconhecimento de voz
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

  // Estado do sistema
  const [state, setState] = React.useState(() => readingGuide.getState());
  const [pendingPause, setPendingPause] = React.useState(false);
  const [audioFinished, setAudioFinished] = React.useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = React.useState(false);

  // Verificação de suporte
  const isSupported = 'speechSynthesis' in window;

  // Inicializar sistema
  useEffect(() => {
    readingGuide.initialize(title, text);
    setState(readingGuide.getState());
    styleManager.updateState(readingGuide.getState().readingMode, audioIsPlaying);
  }, [title, text, readingGuide, styleManager, audioIsPlaying]);

  // Sincronizar estado
  const syncState = React.useCallback(() => {
    const newState = readingGuide.getState();
    setState(newState);
    styleManager.updateState(newState.readingMode, audioIsPlaying);
  }, [readingGuide, styleManager, audioIsPlaying]);

  // Atualizar estado
  const updateState = React.useCallback((updates: any) => {
    readingGuide.updateState(updates);
    syncState();
  }, [readingGuide, syncState]);

  // Iniciar leitura guiada
  const startGuidedReading = React.useCallback((fromPosition: number = 0) => {
    if (audioIsPlaying && !isPaused) {
      console.log('[ReadingLesson] Reprodução já ativa - ignorando nova chamada');
      return;
    }
    
    console.log(`[ReadingLesson] Iniciando leitura guiada da posição ${fromPosition}`);
    setPendingPause(false);
    
    const wordInfo = readingGuide.getWordInfo();
    const fullText = `${wordInfo.titleWords.join(' ')}. ${wordInfo.textWords.join(' ')}`;
    
    playText(fullText, 'en-US', fromPosition, (word: string, wordIndex: number) => {
      console.log(`[ReadingLesson] Destacando palavra ${wordIndex}: "${word}"`);
      
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
        console.log(`[ReadingLesson] Executando pausa suave após palavra ${wordIndex}`);
        setTimeout(() => {
          pauseAudio();
          setPendingPause(false);
          updateState({ isPlaying: false });
        }, 300);
      }
    });
    
    updateState({ isPlaying: true });
  }, [readingGuide, audioIsPlaying, isPaused, playText, pauseAudio, syncState, updateState, pendingPause]);

  // Controlar play/pause
  const handlePlayPause = React.useCallback(() => {
    const currentState = readingGuide.getState();
    console.log('[ReadingLesson] Play/Pause acionado:', {
      isPlaying: audioIsPlaying,
      isPaused,
      isStopped,
      readingMode: currentState.readingMode,
      lastCompletedWordIndex: currentState.lastCompletedWordIndex
    });

    if (audioIsPlaying) {
      if (currentState.readingMode === 'guided' && speechSynthesis.speaking) {
        console.log('[ReadingLesson] Solicitando pausa suave');
        setPendingPause(true);
      } else {
        console.log('[ReadingLesson] Pausando imediatamente');
        pauseAudio();
        updateState({ isPlaying: false });
      }
    } else if (isPaused && !isStopped && currentState.readingMode === 'guided') {
      const resumePosition = Math.max(0, currentState.lastCompletedWordIndex + 1);
      console.log(`[ReadingLesson] Retomando da palavra ${resumePosition}`);
      
      const resumed = resumeAudio();
      
      if (resumed) {
        updateState({ isPlaying: true });
      } else {
        console.log(`[ReadingLesson] Resume falhou - continuando da posição ${resumePosition}`);
        updateState({ currentWordIndex: resumePosition });
        startGuidedReading(resumePosition);
      }
    } else {
      const startPosition = isStopped ? 0 : Math.max(0, currentState.lastCompletedWordIndex >= 0 ? currentState.lastCompletedWordIndex + 1 : 0);
      console.log(`[ReadingLesson] Iniciando nova reprodução da posição ${startPosition}`);
      
      updateState({
        currentWordIndex: startPosition,
        isPlaying: true
      });
      startGuidedReading(startPosition);
    }
  }, [readingGuide, audioIsPlaying, isPaused, isStopped, pauseAudio, resumeAudio, startGuidedReading, updateState]);

  // Reiniciar lição
  const resetLesson = React.useCallback(() => {
    stopAudio();
    readingGuide.reset();
    
    setAudioFinished(false);
    setShowCompletionMessage(false);
    setPendingPause(false);
    
    stopListening();
    resetTranscript();
    
    syncState();
    console.log('[ReadingLesson] Reset completo realizado');
  }, [stopAudio, readingGuide, stopListening, resetTranscript, syncState]);

  // Manipular clique em palavra
  const handleWordClick = React.useCallback((word: string, index: number) => {
    console.log(`[ReadingLesson] Palavra clicada: "${word}" (índice ${index})`);
    
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

  // Definir modo de leitura
  const setReadingMode = React.useCallback((mode: 'guided' | 'practice') => {
    console.log(`[ReadingLesson] Mudando para modo: ${mode}`);
    
    stopAudio();
    stopListening();
    resetTranscript();
    
    updateState({
      readingMode: mode,
      isPlaying: false,
      currentWordIndex: -1
    });
  }, [stopAudio, stopListening, resetTranscript, updateState]);

  // Completar lição
  const completeLesson = React.useCallback(() => {
    updateState({ readingProgress: 100 });
    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [updateState, onComplete]);

  // Controles de áudio para header
  const audioControls = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        disabled={!isSupported}
        className="text-white hover:bg-white/20"
      >
        {audioIsPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={resetLesson}
        className="text-white hover:bg-white/20"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  ), [audioIsPlaying, isSupported, handlePlayPause, resetLesson]);

  // Verificar conclusão automática
  useEffect(() => {
    if (readingGuide.isReadingComplete() && !showCompletionMessage) {
      console.log('[ReadingLesson] Leitura completada automaticamente');
      setAudioFinished(true);
      setShowCompletionMessage(true);
      
      const timer = setTimeout(() => {
        completeLesson();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.completedWords, readingGuide, showCompletionMessage, completeLesson]);

  // Passar controles para o header
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(audioControls);
    }
  }, [onControlsReady, audioControls]);

  // Obter informações das palavras
  const wordInfo = readingGuide.getWordInfo();
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
      {/* Progress and Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {/* Progress Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="lg:col-span-2">
          <Card className="card-glass border-2 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">Progresso da Leitura</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {Math.round(state.readingProgress)}%
                </Badge>
              </div>
              <Progress value={state.readingProgress} className="h-3 mb-2" />
              <div className="text-sm text-gray-600">
                {state.completedWords.size} de {wordInfo.totalWords} palavras lidas
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode Selection */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="card-glass border-2 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Modo de Leitura
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'guided', label: 'Guiada', icon: Headphones },
                  { key: 'practice', label: 'Prática', icon: Mic }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={state.readingMode === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReadingMode(key as any)}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Reading Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-glass border-2 border-indigo-200 min-h-[400px]">
          <CardHeader className="text-center pb-4">
            {/* Reading Controls */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Button
                onClick={handlePlayPause}
                disabled={!isSupported}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {audioIsPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : isPaused && !isStopped ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Leitura Guiada
                  </>
                )}
              </Button>

              {(audioIsPlaying || isPaused) && (
                <Button
                  onClick={() => {
                    stopAudio();
                    updateState({ isPlaying: false, currentWordIndex: -1 });
                  }}
                  variant="outline"
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              )}

              {speechRecognitionSupported && state.readingMode === 'practice' && (
                <Button
                  onClick={() => {
                    if (state.isListening) {
                      stopListening();
                      updateState({ isListening: false });
                    } else {
                      startListening();
                      updateState({ isListening: true });
                    }
                  }}
                  variant={state.isListening ? "destructive" : "outline"}
                  className="border-2 border-green-300 text-green-600 hover:bg-green-50"
                >
                  {state.isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Gravar Pronúncia
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={resetLesson}
                variant="outline"
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            {/* Interactive Text */}
            <motion.div
              className="text-base sm:text-lg lg:text-xl leading-loose sm:leading-relaxed text-gray-800 text-justify space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Título */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  {wordInfo.titleWords.map((word, wordIndex) => {
                    const wordData = readingGuide.getTitleWordData(word, wordIndex);
                    const styling = styleManager.getWordStyling(wordData);
                    
                    return (
                      <span
                        key={`title-${wordIndex}`}
                        data-word-index={wordData.globalIndex}
                        className={styleManager.getCompleteWordClassName(wordData)}
                        onClick={() => handleWordClick(word, wordData.globalIndex)}
                        title={styling.title}
                        style={styling.style}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>
              </div>

              {/* Parágrafos do texto */}
              {paragraphs.map((paragraph, pIndex) => (
                <p key={`paragraph-${pIndex}`} className="leading-relaxed">
                  {readingGuide.splitTextIntoWords(paragraph).map((word, wordIndex) => {
                    const wordData = readingGuide.getWordData(word, pIndex, wordIndex);
                    const styling = styleManager.getWordStyling(wordData);
                    
                    return (
                      <span
                        key={`${pIndex}-${wordIndex}-${wordData.globalIndex}`}
                        data-word-index={wordData.globalIndex}
                        className={styleManager.getCompleteWordClassName(wordData)}
                        onClick={() => handleWordClick(word, wordData.globalIndex)}
                        title={styling.title}
                        style={styling.style}
                      >
                        {word}
                      </span>
                    );
                  })}
                </p>
              ))}
            </motion.div>

            {/* Completion Message */}
            <AnimatePresence>
              {showCompletionMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                >
                  <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className="bg-white rounded-xl p-8 text-center shadow-2xl max-w-md mx-4"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Parabéns!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você completou a leitura com sucesso!
                    </p>
                    <div className="text-sm text-gray-500">
                      Redirecionando automaticamente...
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}