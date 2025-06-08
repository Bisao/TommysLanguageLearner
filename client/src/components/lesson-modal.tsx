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
      
      
          
            
              
            
              
                
                
              
            
          

          
            
              
                Progresso da Lição
                {currentQuestionIndex + 1} de {questions.length}
              
            
             
          

          
            
              
                
                  {currentQuestion?.question}
                
                
                  
                    
                  
                
              

              
                {currentQuestion?.options?.map((option: string, index: number) => (
                  
                      
                        
                          {String.fromCharCode(65 + index)}
                        
                        {option}
                      
                    
                  
                ))}
              

              
                
                  Pular
                
                
                  {submitAnswerMutation.isPending ? "Verificando..." : "Verificar"}
                
              
            
          

          
            
              
                
                
                handleNextQuestion
              
            
          

          
            
              
                
                (lesson as any).title
                currentLessonId
                
                  
                    navigateToNextLesson(nextLessonId)
                  
                   onClose()
                  
                
                
                   onClose()
                  
                
              
            
          
        
    </AnimatePresence>
  );
}