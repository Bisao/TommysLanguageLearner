import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  BookOpen, 
  Eye, 
  Clock,
  Headphones,
  Mic,
  MicOff,
  CheckCircle2,
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface ReadingLessonProps {
  title: string;
  text: string;
  onComplete: () => void;
  onControlsReady?: (controls: React.ReactNode) => void;
}

export default function ReadingLesson({ 
  title, 
  text, 
  onComplete, 
  onControlsReady 
}: ReadingLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [readingMode, setReadingMode] = useState<'normal' | 'guided' | 'practice'>('normal');
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [showTranslation, setShowTranslation] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopSpeaking, isSupported } = useSpeech();
  const { 
    startListening, 
    stopListening, 
    transcript, 
    isSupported: speechRecognitionSupported 
  } = useSpeechRecognition();

  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;

  const handleWordClick = useCallback((word: string, index: number) => {
    if (isSupported) {
      speak(word);
      setCurrentWordIndex(index);
      setCompletedWords(prev => new Set(prev).add(index));
    }
  }, [speak, isSupported]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    } else {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      if (readingMode === 'guided') {
        startGuidedReading();
      } else {
        // Natural reading of full text with improved settings
        speak(text, {
          rate: 0.85, // Natural speaking pace
          pitch: 1.0,
          volume: 0.9
        });
      }
    }
  }, [isPlaying, readingMode, text, speak, stopSpeaking]);

  const startGuidedReading = useCallback(() => {
    let wordIndex = 0;
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setCurrentWordIndex(wordIndex);
        speak(words[wordIndex]);
        setCompletedWords(prev => new Set(prev).add(wordIndex));
        wordIndex++;
      } else {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
        clearInterval(interval);
      }
    }, 1500);
  }, [words, speak]);

  const handleMicrophoneToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  }, [isListening, startListening, stopListening]);

  const resetLesson = useCallback(() => {
    stopSpeaking();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setReadingProgress(0);
    setCompletedWords(new Set());
    setIsListening(false);
    stopListening();
  }, [stopSpeaking, stopListening]);

  const completeLesson = useCallback(() => {
    setReadingProgress(100);
    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [onComplete]);

  // Atualizar progresso baseado nas palavras completadas
  useEffect(() => {
    const progress = (completedWords.size / totalWords) * 100;
    setReadingProgress(progress);

    if (progress >= 80 && completedWords.size > totalWords * 0.8) {
      // Auto-completar quando 80% das palavras foram lidas
      setTimeout(completeLesson, 2000);
    }
  }, [completedWords, totalWords, completeLesson]);

  // Controles de áudio para o header - memoized para evitar recriação
  const audioControls = useMemo(() => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        disabled={!isSupported}
        className="text-white hover:bg-white/20"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {speechRecognitionSupported && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMicrophoneToggle}
          className={`text-white hover:bg-white/20 ${
            isListening ? 'microphone-pulse bg-red-500' : ''
          }`}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={resetLesson}
        className="text-white hover:bg-white/20"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  ), [isPlaying, isSupported, speechRecognitionSupported, isListening, handlePlayPause, handleMicrophoneToggle, resetLesson]);

  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(audioControls);
    }
  }, [onControlsReady, audioControls]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 space-y-6">
      {/* Progress and Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Progress Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="lg:col-span-2">
          <Card className="card-glass border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">Progresso da Leitura</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {Math.round(readingProgress)}%
                </Badge>
              </div>
              <Progress value={readingProgress} className="h-3 mb-2" />
              <div className="text-sm text-gray-600">
                {completedWords.size} de {totalWords} palavras lidas
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode Selection */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="card-glass border-2 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Modo de Leitura
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'normal', label: 'Normal', icon: BookOpen },
                  { key: 'guided', label: 'Guiada', icon: Headphones },
                  { key: 'practice', label: 'Prática', icon: Mic }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={readingMode === key ? "default" : "outline"}
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
            <CardTitle className="text-2xl sm:text-3xl gradient-text-reading mb-4">
              {title}
            </CardTitle>

            {/* Reading Controls */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Button
                onClick={handlePlayPause}
                disabled={!isSupported}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {readingMode === 'guided' ? 'Leitura Guiada' : 'Reproduzir'}
                  </>
                )}
              </Button>

              {speechRecognitionSupported && readingMode === 'practice' && (
                <Button
                  onClick={handleMicrophoneToggle}
                  variant="outline"
                  className={`border-2 ${
                    isListening 
                      ? 'border-red-400 bg-red-50 text-red-600 microphone-pulse' 
                      : 'border-gray-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Praticar Pronúncia
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={resetLesson}
                variant="outline"
                className="border-2 border-gray-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Reading Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{totalWords}</div>
                <div className="text-gray-600">Palavras</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{completedWords.size}</div>
                <div className="text-gray-600">Lidas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">~5min</div>
                <div className="text-gray-600">Tempo</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">B1</div>
                <div className="text-gray-600">Nível</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {/* Interactive Text */}
            <motion.div
              ref={textRef}
              className="text-lg sm:text-xl leading-relaxed text-gray-800 text-justify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {words.map((word, index) => {
                const isCurrentWord = currentWordIndex === index;
                const isCompleted = completedWords.has(index);

                return (
                  <motion.span
                    key={index}
                    onClick={() => handleWordClick(word, index)}
                    className={`
                      text-word-highlight inline-block mx-1 my-1 px-2 py-1 rounded-md cursor-pointer
                      transition-all duration-300 hover:bg-blue-100 hover:scale-105
                      ${isCurrentWord ? 'text-word-current bg-blue-500 text-white' : ''}
                      ${isCompleted ? 'bg-green-100 text-green-800' : ''}
                      ${!isCompleted && !isCurrentWord ? 'hover:bg-gray-100' : ''}
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    {word}
                    {isCompleted && (
                      <CheckCircle2 className="w-3 h-3 text-green-600 inline ml-1" />
                    )}
                    {isCurrentWord && (
                      <motion.div
                        className="floating-audio-icon inline ml-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Volume2 className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.span>
                );
              })}
            </motion.div>

            {/* Speech Recognition Feedback */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">Gravando sua pronúncia...</span>
                  </div>
                  {transcript && (
                    <div className="text-gray-700 bg-white p-2 rounded border">
                      <strong>Você disse:</strong> "{transcript}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completion Message */}
            <AnimatePresence>
              {readingProgress >= 80 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 text-center"
                >
                  <Card className="border-2 border-green-300 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-semibold text-lg">
                          Excelente! Você completou a leitura!
                        </span>
                      </div>
                      <p className="text-green-600 mt-2">
                        Preparando sua próxima lição...
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { 
            title: "Repetir Texto", 
            icon: RotateCcw, 
            action: () => speak(text),
            color: "blue"
          },
          { 
            title: "Modo Silencioso", 
            icon: VolumeX, 
            action: stopSpeaking,
            color: "gray"
          },
          { 
            title: "Tradução", 
            icon: Eye, 
            action: () => setShowTranslation(!showTranslation),
            color: "purple"
          },
          { 
            title: "Finalizar", 
            icon: ChevronRight, 
            action: completeLesson,
            color: "green"
          }
        ].map(({ title, icon: Icon, action, color }, index) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              className={`cursor-pointer border-2 border-${color}-200 hover:border-${color}-300 transition-all duration-300 hover:shadow-lg`}
              onClick={action}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`w-6 h-6 text-${color}-500 mx-auto mb-2`} />
                <span className="text-sm font-medium text-gray-700">{title}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}