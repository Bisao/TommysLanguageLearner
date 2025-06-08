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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartoon-teal mx-auto"></div>
          <p className="mt-4 text-center">Carregando lição...</p>
        </div>
      </div>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p>Lição não encontrada.</p>
          <Button onClick={onClose} className="mt-4">Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl border-4 border-cartoon-teal max-w-2xl w-full max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-3 sm:p-6 border-b-2 border-cartoon-gray">
            <h3 className="text-lg sm:text-2xl font-bold text-cartoon-dark">{(lesson as any).title}</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 touch-manipulation"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="p-3 sm:p-6 pb-0">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Progresso da Lição</span>
              <span>{currentQuestionIndex + 1} de {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2 sm:h-3" />
          </div>

          {/* Question Content */}
          <div className="p-3 sm:p-6">
            {/* Question Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h4 className="text-lg sm:text-xl font-bold text-cartoon-dark mb-2 px-2">
                {currentQuestion?.question}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayAudio}
                className="bg-cartoon-blue hover:bg-cartoon-blue/80 text-white border-0 w-10 h-10 rounded-full"
              >
                <Volume2 size={14} className="sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestion?.options?.map((option: string, index: number) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-3 sm:p-4 text-left font-semibold rounded-xl border-2 transition-all duration-200 touch-manipulation ${
                    selectedAnswer === option
                      ? "border-cartoon-teal bg-cartoon-teal/10 text-cartoon-dark"
                      : "border-gray-300 bg-cartoon-gray hover:border-cartoon-teal hover:bg-cartoon-mint/10"
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-bold ${
                      selectedAnswer === option
                        ? "border-cartoon-teal bg-cartoon-teal text-white"
                        : "border-gray-400 text-gray-600"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleSkipQuestion}
                className="text-gray-600 hover:text-gray-800"
              >
                Pular
              </Button>
              <Button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer || submitAnswerMutation.isPending}
                className="cartoon-button"
              >
                {submitAnswerMutation.isPending ? "Verificando..." : "Verificar"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feedback Modal */}
        {showFeedback && (
          <FeedbackModal
            isCorrect={answers[currentQuestion.id]}
            correctAnswer={currentQuestion.correctAnswer}
            explanation={currentQuestion.explanation}
            onContinue={handleNextQuestion}
          />
        )}

        {/* Completion Modal */}
        {showCompletion && lessonResults && (
          <CompletionModal
            results={lessonResults}
            lessonTitle={(lesson as any).title}
            currentLessonId={currentLessonId}
            onNextLesson={(nextLessonId) => {
              setShowCompletion(false);
              if (nextLessonId) {
                // Navigate to next lesson internally
                navigateToNextLesson(nextLessonId);
              } else {
                onClose();
              }
            }}
            onBackToHome={() => {
              setShowCompletion(false);
              onClose();
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}