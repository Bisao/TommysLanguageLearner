
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, X } from "lucide-react";
import { useAudio } from "@/hooks/use-audio";
import { useToast } from "@/hooks/use-toast";
import FeedbackModal from "./feedback-modal";
import CompletionModal from "./completion-modal";
import { apiRequest } from "@/lib/queryClient";

interface LessonModalProps {
  lessonId: number;
  onClose: () => void;
}

export default function LessonModal({ lessonId, onClose }: LessonModalProps) {
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [lessonResults, setLessonResults] = useState<{
    score: number;
    totalQuestions: number;
    xpEarned: number;
    correct: number;
    incorrect: number;
  } | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: boolean}>({});
  const [startTime, setStartTime] = useState(Date.now());

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playText } = useAudio();

  const { data: lesson, isLoading } = useQuery({
    queryKey: [`/api/lessons/${currentLessonId}`],
  });

  const questions = (lesson as any)?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { lessonId: number; questionId: string; answer: string }) => {
      const response = await apiRequest("POST", "/api/lessons/answer", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: data.correct
      }));
      setShowFeedback(true);

      // Invalidate user cache immediately if XP was earned
      if (data.correct && data.xpEarned > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      }
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (data: { lessonId: number; score: number; totalQuestions: number; timeSpent: number }) => {
      const response = await apiRequest("POST", "/api/lessons/complete", data);
      return response.json();
    },
    onSuccess: (data) => {
      const correct = Object.values(answers).filter(Boolean).length;
      const incorrect = Object.values(answers).length - correct;

      setLessonResults({
        score: data.score,
        totalQuestions: questions.length,
        xpEarned: data.xpEarned,
        correct,
        incorrect,
      });
      setShowCompletion(true);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    submitAnswerMutation.mutate({
      lessonId: currentLessonId,
      questionId: currentQuestion.id,
      answer: selectedAnswer,
    });
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete lesson
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const score = Object.values(answers).filter(Boolean).length;

      completeLessonMutation.mutate({
        lessonId: currentLessonId,
        score,
        totalQuestions: questions.length,
        timeSpent,
      });
    }
  };

  const handleSkipQuestion = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: false
    }));
    handleNextQuestion();
  };

  const handlePlayAudio = () => {
    if (currentQuestion?.question) {
      playText(currentQuestion.question.replace(/['"]/g, ''));
    }
  };

  const navigateToNextLesson = (nextLessonId: number) => {
    // Reset all states for new lesson
    setCurrentLessonId(nextLessonId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowCompletion(false);
    setLessonResults(null);
    setAnswers({});
    setStartTime(Date.now());

    // Update URL without page reload
    window.history.pushState({}, '', `/lesson/${nextLessonId}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartoon-teal mx-auto"></div>
          <p className="mt-4 text-center text-sm sm:text-base">Carregando lição...</p>
        </div>
      </div>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full">
          <p className="text-sm sm:text-base">Lição não encontrada.</p>
          <Button onClick={onClose} className="mt-4 w-full sm:w-auto">Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-cartoon-dark">
                Progresso da Lição
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentQuestionIndex + 1} de {questions.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 sm:px-6 py-3 border-b">
            <Progress value={progress} className="h-2 sm:h-3" />
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-cartoon-dark">
                    {currentQuestion?.question}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayAudio}
                    className="shrink-0 ml-2"
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion?.options?.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                        selectedAnswer === option
                          ? 'border-cartoon-teal bg-cartoon-teal bg-opacity-10'
                          : 'border-gray-200 hover:border-cartoon-teal'
                      } ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm sm:text-base">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleSkipQuestion}
                    disabled={showFeedback}
                    className="order-2 sm:order-1"
                  >
                    Pular
                  </Button>
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={!selectedAnswer || showFeedback || submitAnswerMutation.isPending}
                    className="order-1 sm:order-2 flex-1 sm:flex-initial"
                  >
                    {submitAnswerMutation.isPending ? "Verificando..." : "Verificar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Modal */}
          {showFeedback && (
            <FeedbackModal
              isCorrect={answers[currentQuestion.id]}
              correctAnswer={currentQuestion.correctAnswer}
              explanation={currentQuestion.explanation}
              onNext={handleNextQuestion}
            />
          )}

          {/* Completion Modal */}
          {showCompletion && lessonResults && (
            <CompletionModal
              results={lessonResults}
              lessonTitle={(lesson as any).title}
              currentLessonId={currentLessonId}
              onNextLesson={(nextLessonId) => {
                if (nextLessonId) {
                  navigateToNextLesson(nextLessonId);
                } else {
                  onClose();
                }
              }}
              onBackToHome={() => onClose()}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
