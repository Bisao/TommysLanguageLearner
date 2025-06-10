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
import { useAudio } from "@/hooks/use-audio";
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
  const [readingMode, setReadingMode] = useState<'guided' | 'practice'>('guided');
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [showTranslation, setShowTranslation] = useState(false);
  const [pronunciationScores, setPronunciationScores] = useState<Map<number, {status: 'correct' | 'close' | 'incorrect', score: number}>>(new Map());
  const [lastTranscriptWords, setLastTranscriptWords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);
  const { 
    playText, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    isPlaying: audioIsPlaying, 
    isPaused,
    currentWordPosition,
    isStopped
  } = useAudio();
  const { 
    startListening, 
    stopListening, 
    transcript,
    interimTranscript,
    confidence,
    resetTranscript,
    isSupported: speechRecognitionSupported 
  } = useSpeechRecognition();

  const isSupported = 'speechSynthesis' in window;

  // Split text into paragraphs and then words, preserving structure
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const allWords = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = allWords.length;

  const handleWordClick = useCallback((word: string, index: number) => {
    if (isSupported) {
      playText(word);
      setCurrentWordIndex(index);
      setCompletedWords(prev => new Set(prev).add(index));
    }
  }, [playText, isSupported]);

  // Função para análise de similaridade de palavras
  const calculateWordSimilarity = useCallback((spoken: string, target: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    const spokenNorm = normalize(spoken);
    const targetNorm = normalize(target);
    
    if (spokenNorm === targetNorm) return 1.0;
    
    // Levenshtein distance adaptado para pronúncia
    const matrix = Array(spokenNorm.length + 1).fill(null).map(() => Array(targetNorm.length + 1).fill(0));
    
    for (let i = 0; i <= spokenNorm.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= targetNorm.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= spokenNorm.length; i++) {
      for (let j = 1; j <= targetNorm.length; j++) {
        const cost = spokenNorm[i - 1] === targetNorm[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[spokenNorm.length][targetNorm.length];
    const maxLength = Math.max(spokenNorm.length, targetNorm.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 0;
  }, []);

  // Função para analisar pronúncia em tempo real - Sequencial rigoroso
  const analyzePronunciation = useCallback((spokenText: string) => {
    if (!spokenText.trim() || readingMode !== 'practice') return;
    
    setIsAnalyzing(true);
    const spokenWords = spokenText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const targetWords = allWords.map(w => w.toLowerCase().replace(/[.,!?;:]/g, ''));
    
    console.log('[PronunciationAnalysis] Analisando sequencialmente:', { 
      spokenWords, 
      currentPosition: currentWordIndex,
      nextExpectedWord: targetWords[currentWordIndex] || 'fim' 
    });
    
    // Começar sempre da posição atual ou próxima não completada
    let currentPosition = Math.max(0, currentWordIndex);
    
    // Encontrar a primeira palavra não completada
    while (currentPosition < targetWords.length && completedWords.has(currentPosition)) {
      currentPosition++;
    }
    
    // Analisar cada palavra falada sequencialmente
    for (let i = 0; i < spokenWords.length; i++) {
      const spokenWord = spokenWords[i];
      
      // Verificar se ainda há palavras para processar
      if (currentPosition >= targetWords.length) {
        console.log(`[PronunciationAnalysis] Texto completo! Posição ${currentPosition} >= ${targetWords.length}`);
        break;
      }
      
      const targetWord = targetWords[currentPosition];
      const similarity = calculateWordSimilarity(spokenWord, targetWord);
      
      console.log(`[PronunciationAnalysis] Posição ${currentPosition}: "${spokenWord}" vs "${targetWord}" = ${similarity.toFixed(2)}`);
      
      if (similarity > 0.6) {
        // Palavra reconhecida na posição correta
        let status: 'correct' | 'close' | 'incorrect';
        if (similarity >= 0.9) {
          status = 'correct';
        } else if (similarity >= 0.75) {
          status = 'close';
        } else {
          status = 'incorrect';
        }
        
        console.log(`[PronunciationAnalysis] ✓ Palavra ${currentPosition} reconhecida: "${spokenWord}" → "${targetWord}" (${status})`);
        
        // Marcar palavra como processada
        setPronunciationScores(prev => new Map(prev).set(currentPosition, { status, score: similarity }));
        setCompletedWords(prev => new Set(prev).add(currentPosition));
        
        // Avançar para próxima palavra
        currentPosition++;
        setCurrentWordIndex(currentPosition);
      } else {
        // Palavra não reconhecida - tentar próxima posição (permitir pequenos saltos)
        console.log(`[PronunciationAnalysis] ✗ Palavra ${currentPosition} não reconhecida suficientemente: "${spokenWord}" vs "${targetWord}" (${similarity.toFixed(2)})`);
        
        // Verificar se a palavra falada corresponde à próxima palavra (tolerância para palavras perdidas)
        if (currentPosition + 1 < targetWords.length) {
          const nextTargetWord = targetWords[currentPosition + 1];
          const nextSimilarity = calculateWordSimilarity(spokenWord, nextTargetWord);
          
          if (nextSimilarity > similarity && nextSimilarity > 0.7) {
            console.log(`[PronunciationAnalysis] ↷ Pulando para próxima palavra: "${spokenWord}" → "${nextTargetWord}"`);
            // Marcar palavra atual como incorreta e avançar
            setPronunciationScores(prev => new Map(prev).set(currentPosition, { status: 'incorrect', score: similarity }));
            currentPosition++;
            
            // Processar a próxima palavra
            setPronunciationScores(prev => new Map(prev).set(currentPosition, { status: 'correct', score: nextSimilarity }));
            setCompletedWords(prev => new Set(prev).add(currentPosition));
            currentPosition++;
            setCurrentWordIndex(currentPosition);
          }
        }
      }
    }
    
    setLastTranscriptWords(spokenWords);
    setIsAnalyzing(false);
  }, [readingMode, allWords, currentWordIndex, completedWords, calculateWordSimilarity]);

  const startGuidedReading = useCallback((fromPosition: number = 0) => {
    console.log(`[ReadingLesson] Iniciando leitura guiada da posição ${fromPosition}`);
    
    playText(text, 'en-US', fromPosition, (word: string, wordIndex: number) => {
      // Verificação mais robusta do estado de reprodução
      const isActivelySpeaking = speechSynthesis.speaking && !speechSynthesis.paused;
      const shouldHighlight = isActivelySpeaking || !speechSynthesis.speaking; // Permite highlight mesmo quando speech acabou
      
      if (shouldHighlight) {
        console.log(`[ReadingLesson] Destacando palavra ${wordIndex}: "${word}"`);
        setCurrentWordIndex(wordIndex);
        setCompletedWords(prev => new Set(prev).add(wordIndex));
      }
    });
  }, [text, playText]);


  const handlePlayPause = useCallback(() => {
    console.log(`[ReadingLesson] handlePlayPause - Estado atual:`, {
      isPlaying, isPaused, isStopped, currentWordPosition, readingMode
    });

    if (isPlaying) {
      // Pausar reprodução atual
      console.log(`[ReadingLesson] Pausando reprodução`);
      pauseAudio();
      setIsPlaying(false);
      // Manter highlighting da palavra atual durante pausa
      // setCurrentWordIndex(-1); // Removido para manter contexto visual
    } else if (isPaused && !isStopped) {
      // Tentar resumir da posição pausada
      console.log(`[ReadingLesson] Tentando resumir da posição ${currentWordPosition}`);
      const resumed = resumeAudio();
      
      if (!resumed) {
        // Se resume falhou, reiniciar da posição atual
        console.log(`[ReadingLesson] Resume falhou - reiniciando da posição ${currentWordPosition}`);
        setCurrentWordIndex(currentWordPosition);
        
        startGuidedReading(currentWordPosition);
      }
      setIsPlaying(true);
    } else {
      // Iniciar do começo ou posição atual
      const startPosition = isStopped ? 0 : Math.max(0, currentWordPosition);
      console.log(`[ReadingLesson] Iniciando nova reprodução da posição ${startPosition}`);
      
      setIsPlaying(true);
      setCurrentWordIndex(startPosition);

      startGuidedReading(startPosition);
    }
  }, [isPlaying, isPaused, isStopped, readingMode, text, playText, pauseAudio, resumeAudio, startGuidedReading, currentWordPosition]);



  const handleMicrophoneToggle = useCallback(() => {
    if (isListening) {
      console.log('[PracticeMode] Parando gravação');
      stopListening();
      setIsListening(false);
    } else {
      console.log('[PracticeMode] Iniciando prática de pronúncia sequencial');
      resetTranscript();
      setPronunciationScores(new Map());
      setCompletedWords(new Set());
      setCurrentWordIndex(0); // Sempre começar da primeira palavra
      startListening();
      setIsListening(true);
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  const resetLesson = useCallback(() => {
    // Stop all audio
    stopAudio();

    // Reset all states
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setReadingProgress(0);
    setCompletedWords(new Set());
    setIsListening(false);
    setPronunciationScores(new Map());
    setLastTranscriptWords([]);
    setIsAnalyzing(false);
    stopListening();
    resetTranscript();
  }, [stopAudio, stopListening, resetTranscript]);

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
  }, [completedWords, totalWords]);

  // Sync isPlaying state with audio hook
  useEffect(() => {
    setIsPlaying(audioIsPlaying);
  }, [audioIsPlaying]);

  // Removido monitoramento de pause state para evitar interferência com highlighting

  // Analisar pronúncia quando transcript muda
  useEffect(() => {
    if (transcript && readingMode === 'practice' && isListening) {
      analyzePronunciation(transcript);
    }
  }, [transcript, readingMode, isListening, analyzePronunciation]);

  // Separate effect for completion check to avoid dependency loop
  useEffect(() => {
    const progress = (completedWords.size / totalWords) * 100;
    if (progress >= 80 && completedWords.size > totalWords * 0.8) {
      // Auto-completar quando 80% das palavras foram lidas
      const timer = setTimeout(() => {
        setReadingProgress(100);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completedWords.size, totalWords, onComplete]);

  // Restore audio controls with proper memoization
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

      <Button
        variant="ghost"
        size="sm"
        onClick={resetLesson}
        className="text-white hover:bg-white/20"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  ), [isPlaying, isSupported, handlePlayPause, resetLesson]);

  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(audioControls);
    }
  }, [onControlsReady, isPlaying, isSupported]);

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

              {(isPlaying || isPaused) && (
                <Button
                  onClick={() => {
                    stopAudio();
                    setIsPlaying(false);
                    setCurrentWordIndex(-1);
                  }}
                  variant="outline"
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              )}

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

          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            {/* Interactive Text */}
            <motion.div
              ref={textRef}
              className="text-base sm:text-lg lg:text-xl leading-loose sm:leading-relaxed text-gray-800 text-justify space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {paragraphs.map((paragraph, pIndex) => (
                <p key={`paragraph-${pIndex}`} className="leading-relaxed">
                  {paragraph.split(' ').map((word, wordIndex) => {
                  // Calcular índice global de forma mais precisa
                  let globalIndex = 0;
                  for (let i = 0; i < pIndex; i++) {
                    globalIndex += paragraphs[i].split(' ').filter(w => w.trim().length > 0).length;
                  }
                  globalIndex += wordIndex;

                  const isCurrentWord = globalIndex === currentWordIndex;
                  const isCompleted = completedWords.has(globalIndex);
                  const pronunciationFeedback = pronunciationScores.get(globalIndex);

                  let wordClassName = '';
                  let wordTitle = `Palavra ${globalIndex + 1}: ${word}`;

                  if (isCurrentWord && readingMode === 'practice') {
                    wordClassName = 'bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-xl transform scale-110 z-10 animate-pulse';
                  } else if (pronunciationFeedback) {
                    const scorePercentage = Math.round(pronunciationFeedback.score * 100);
                    wordTitle += ` - Pronúncia: ${pronunciationFeedback.status === 'correct' ? 'Excelente' : pronunciationFeedback.status === 'close' ? 'Boa' : 'Precisa melhorar'} (${scorePercentage}%)`;
                    
                    switch (pronunciationFeedback.status) {
                      case 'correct':
                        wordClassName = 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold border-2 border-green-300 shadow-md';
                        break;
                      case 'close':
                        wordClassName = 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-medium border-2 border-yellow-300 shadow-md';
                        break;
                      case 'incorrect':
                        wordClassName = 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-medium border-2 border-red-300 shadow-md';
                        break;
                    }
                  } else if (isCurrentWord && readingMode === 'guided') {
                    wordClassName = 'bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-xl transform scale-110 z-10';
                  } else if (isCompleted) {
                    wordClassName = 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-medium';
                  } else {
                    wordClassName = 'hover:bg-gray-100 hover:shadow-md';
                  }

                  return (
                    <span
                      key={`${pIndex}-${wordIndex}-${globalIndex}`}
                      data-word-index={globalIndex}
                      className={`
                        inline-block mx-0.5 sm:mx-1 my-0.5 sm:my-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md cursor-pointer
                        transition-all duration-300 hover:scale-105
                        ${wordClassName}
                      `}
                      onClick={() => handleWordClick(word, globalIndex)}
                      title={wordTitle}
                    >
                      {word}
                    </span>
                  );
                })}
                </p>
              ))}
            </motion.div>

            {/* Speech Recognition Feedback */}
            <AnimatePresence>
              {isListening && readingMode === 'practice' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-bold">🎤 Análise de Pronúncia Ativa</span>
                    {isAnalyzing && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    )}
                  </div>
                  
                  {(transcript || interimTranscript) && (
                    <div className="space-y-2">
                      <div className="text-gray-700 bg-white p-3 rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="text-blue-700">Reconhecido:</strong>
                          {confidence > 0 && (
                            <Badge variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "destructive"}>
                              {Math.round(confidence * 100)}% confiança
                            </Badge>
                          )}
                        </div>
                        <div className="text-lg">
                          {transcript && <span className="text-green-700 font-medium">{transcript}</span>}
                          {interimTranscript && <span className="text-gray-500 italic"> {interimTranscript}</span>}
                        </div>
                      </div>
                      
                      {pronunciationScores.size > 0 && (
                        <div className="bg-white p-3 rounded border">
                          <strong className="text-blue-700 block mb-2">Feedback de Pronúncia:</strong>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <div className="text-green-600 font-bold text-lg">
                                {Array.from(pronunciationScores.values()).filter(s => s.status === 'correct').length}
                              </div>
                              <div className="text-green-600">Excelente</div>
                            </div>
                            <div className="text-center">
                              <div className="text-yellow-600 font-bold text-lg">
                                {Array.from(pronunciationScores.values()).filter(s => s.status === 'close').length}
                              </div>
                              <div className="text-yellow-600">Boa</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-600 font-bold text-lg">
                                {Array.from(pronunciationScores.values()).filter(s => s.status === 'incorrect').length}
                              </div>
                              <div className="text-red-600">Melhorar</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 text-sm text-blue-600">
                    💡 <strong>Dica:</strong> Leia em voz alta seguindo o texto. As palavras ficarão coloridas conforme sua pronúncia.
                  </div>
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
            action: () => playText(text),
            color: "blue"
          },
          { 
            title: "Modo Silencioso", 
            icon: VolumeX, 
            action: stopAudio,
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