
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Play, Pause, RotateCcw, Volume2, Mic, MicOff, Eye, EyeOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/use-speech-recognition';
import { useAudio } from '../hooks/use-audio';
import { cn } from '../lib/utils';

interface ReadingLessonProps {
  lesson: {
    id: string;
    title: string;
    text: string;
    level: string;
    category: string;
    estimatedTime: number;
    xpReward: number;
  };
  onComplete?: (stats: any) => void;
}

interface WordStatus {
  word: string;
  status: 'pending' | 'correct' | 'close' | 'incorrect';
}

export default function ReadingLesson({ lesson, onComplete }: ReadingLessonProps) {
  const [isReading, setIsReading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [translationPosition, setTranslationPosition] = useState({ x: 0, y: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef('');

  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening,
    isSupported: speechSupported 
  } = useSpeechRecognition();

  const { playAudio, isPlaying, pauseAudio } = useAudio();

  // Initialize word statuses only once when lesson changes
  const initialWordStatuses = useMemo(() => {
    if (!lesson?.text) return [];

    const words = lesson.text.split(/\s+/).filter(word => word.length > 0);
    return words.map(word => ({
      word: word.toLowerCase().replace(/[.,!?;:]/g, ''),
      status: 'pending' as const
    }));
  }, [lesson?.text]);

  // Initialize word statuses when lesson changes
  useEffect(() => {
    setWordStatuses(initialWordStatuses);
    setUserTranscript('');
    setAccuracyScore(0);
    lastTranscriptRef.current = '';
  }, [initialWordStatuses]);

  // Timer effect
  useEffect(() => {
    if (isReading) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isReading]);

  // Calculate similarity between two words
  const calculateSimilarity = useCallback((word1: string, word2: string): number => {
    const w1 = word1.toLowerCase().replace(/[.,!?;:]/g, '');
    const w2 = word2.toLowerCase().replace(/[.,!?;:]/g, '');

    if (w1 === w2) return 1;

    const len1 = w1.length;
    const len2 = w2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (w2.charAt(i - 1) === w1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }, []);

  // Update word accuracy based on speech transcript
  const updateWordAccuracy = useCallback((transcript: string, textWords: string[]) => {
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    setWordStatuses(prevStatuses => {
      const newStatuses = [...prevStatuses];

      spokenWords.forEach(spokenWord => {
        let bestMatch = -1;
        let bestSimilarity = 0;

        textWords.forEach((textWord, index) => {
          const similarity = calculateSimilarity(textWord, spokenWord);
          if (similarity > bestSimilarity && similarity > 0.3) {
            bestSimilarity = similarity;
            bestMatch = index;
          }
        });

        if (bestMatch !== -1 && newStatuses[bestMatch]) {
          if (bestSimilarity >= 0.9) {
            newStatuses[bestMatch].status = 'correct';
          } else if (bestSimilarity >= 0.6) {
            newStatuses[bestMatch].status = 'close';
          } else {
            newStatuses[bestMatch].status = 'incorrect';
          }
        }
      });

      return newStatuses;
    });
  }, [calculateSimilarity]);

  // Calculate reading progress
  const calculateProgress = useCallback((transcript: string, totalWords: number): number => {
    const spokenWords = transcript.split(/\s+/).filter(word => word.length > 0).length;
    return Math.min((spokenWords / totalWords) * 100, 100);
  }, []);

  // Handle transcript updates - only when transcript actually changes
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current && lesson?.text) {
      lastTranscriptRef.current = transcript;
      setUserTranscript(transcript);
      
      const textWords = lesson.text.split(/\s+/).filter(word => word.length > 0);
      const progress = calculateProgress(transcript, textWords.length);
      setAccuracyScore(progress);
      updateWordAccuracy(transcript, textWords);
    }
  }, [transcript, lesson?.text, calculateProgress, updateWordAccuracy]);

  // Start guided reading
  const startGuidedReading = useCallback(() => {
    setIsReading(true);
    setCurrentTime(0);
    setUserTranscript('');
    setAccuracyScore(0);
    lastTranscriptRef.current = '';

    if (speechSupported) {
      startListening();
    }
  }, [speechSupported, startListening]);

  // Stop reading
  const stopReading = useCallback(() => {
    setIsReading(false);
    stopListening();

    if (accuracyScore >= 80) {
      setIsComplete(true);
      onComplete?.({
        timeSpent: currentTime,
        accuracy: accuracyScore,
        wordsRead: userTranscript.split(/\s+/).length
      });
    }
  }, [stopListening, accuracyScore, currentTime, userTranscript, onComplete]);

  // Reset reading session
  const resetReading = useCallback(() => {
    setIsReading(false);
    setCurrentTime(0);
    setUserTranscript('');
    setAccuracyScore(0);
    setIsComplete(false);
    setWordStatuses(initialWordStatuses);
    lastTranscriptRef.current = '';
    stopListening();
  }, [initialWordStatuses, stopListening]);

  // Handle text selection for translation
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      setSelectedText(selectedText);

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTranslationPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      }
    } else {
      setSelectedText('');
    }
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!lesson) {
    return <div>Loading lesson...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">{lesson.level}</Badge>
                <Badge variant="outline">{lesson.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {lesson.estimatedTime} min
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{formatTime(currentTime)}</div>
              <div className="text-sm text-muted-foreground">Reading Time</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {!isReading ? (
                <Button onClick={startGuidedReading} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Start Reading
                </Button>
              ) : (
                <Button onClick={stopReading} variant="secondary" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Stop Reading
                </Button>
              )}

              <Button onClick={resetReading} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {speechSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center gap-2"
                >
                  {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </Button>
              )}

              <div className="flex items-center gap-2">
                {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                <span className="text-sm">
                  {isListening ? 'Listening...' : 'Not listening'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Reading Progress</span>
              <span>{Math.round(accuracyScore)}%</span>
            </div>
            <Progress value={accuracyScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Reading Text */}
      <Card>
        <CardContent className="pt-6">
          <div 
            className="text-lg leading-relaxed space-y-4 select-text"
            onMouseUp={handleTextSelection}
          >
            {lesson.text.split(/\s+/).map((word, index) => {
              const wordStatus = wordStatuses[index];
              return (
                <span
                  key={index}
                  className={cn(
                    "transition-colors duration-200",
                    wordStatus?.status === 'correct' && "bg-green-200 text-green-800",
                    wordStatus?.status === 'close' && "bg-yellow-200 text-yellow-800",
                    wordStatus?.status === 'incorrect' && "bg-red-200 text-red-800"
                  )}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Reading Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg min-h-[100px]">
                  {userTranscript || 'Start reading to see your transcript here...'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translation Popup */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-black text-white px-3 py-2 rounded-lg text-sm"
            style={{
              left: translationPosition.x,
              top: translationPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-medium">{selectedText}</div>
            <div className="text-xs opacity-75">Click outside to close</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
              <p className="text-muted-foreground mb-6">
                You've completed the reading lesson with {Math.round(accuracyScore)}% accuracy!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <div className="font-medium">Time Spent</div>
                  <div className="text-muted-foreground">{formatTime(currentTime)}</div>
                </div>
                <div>
                  <div className="font-medium">XP Earned</div>
                  <div className="text-muted-foreground">{lesson.xpReward} XP</div>
                </div>
              </div>
              <Button onClick={resetReading} className="w-full">
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
