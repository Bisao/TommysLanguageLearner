/**
 * Serviço de lições
 * 
 * Este módulo fornece serviços relacionados ao gerenciamento de lições,
 * incluindo busca, submissão de respostas e conclusão de lições.
 */

import { storage } from '../storage';
import { userService } from './user.service';
import { statsService } from './stats.service';
import { log, error } from '../utils/logger';
import { Lesson, UserProgress } from '../models';
import { z } from 'zod';

// Schema de validação para submissão de respostas
export const submitAnswerSchema = z.object({
  lessonId: z.number().positive(),
  questionId: z.string().min(1),
  answer: z.string().min(1),
  timeSpent: z.number().positive().optional(),
});

// Schema de validação para completar lições/quizzes
export const completeQuizSchema = z.object({
  lessonId: z.number().positive(),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().positive(),
  timeSpent: z.number().positive(),
});

export class LessonService {
  /**
   * Obtém todas as lições
   * @returns Lista de lições
   */
  async getAllLessons(): Promise<Lesson[]> {
    try {
      return await storage.getAllLessons();
    } catch (err) {
      error("Error fetching all lessons", err);
      throw err;
    }
  }
  
  /**
   * Obtém lições por categoria
   * @param category Categoria das lições
   * @returns Lista de lições da categoria
   */
  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    try {
      return await storage.getLessonsByCategory(category);
    } catch (err) {
      error(`Error fetching lessons by category: ${category}`, err);
      throw err;
    }
  }
  
  /**
   * Obtém uma lição específica
   * @param lessonId ID da lição
   * @returns Lição ou null se não encontrada
   */
  async getLesson(lessonId: number): Promise<Lesson | null> {
    try {
      const lesson = await storage.getLesson(lessonId);
      return lesson || null;
    } catch (err) {
      error(`Error fetching lesson ${lessonId}`, err);
      throw err;
    }
  }
  
  /**
   * Obtém lições com informações de progresso do usuário
   * @param userId ID do usuário
   * @param category Categoria opcional para filtrar
   * @returns Lista de lições com progresso
   */
  async getLessonsWithProgress(userId: number, category?: string): Promise<any[]> {
    try {
      // Obtém as lições
      const lessons = category 
        ? await storage.getLessonsByCategory(category)
        : await storage.getAllLessons();
      
      // Obtém o progresso do usuário para cada lição
      const userProgress = await storage.getUserProgress(userId);
      
      // Combina as lições com o progresso
      const lessonsWithProgress = lessons.map(lesson => {
        const progress = userProgress.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          completed: progress?.completed || false,
          score: progress?.score || 0,
          attempts: progress?.attempts || 0
        };
      });
      
      return lessonsWithProgress;
    } catch (err) {
      error(`Error fetching lessons with progress for user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Obtém uma lição com informações de progresso do usuário
   * @param userId ID do usuário
   * @param lessonId ID da lição
   * @returns Lição com progresso ou null se não encontrada
   */
  async getLessonWithProgress(userId: number, lessonId: number): Promise<any | null> {
    try {
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return null;
      }
      
      const progress = await storage.getLessonProgress(userId, lessonId);
      
      return {
        ...lesson,
        completed: progress?.completed || false,
        score: progress?.score || 0,
        attempts: progress?.attempts || 0
      };
    } catch (err) {
      error(`Error fetching lesson ${lessonId} with progress for user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Valida uma resposta de exercício
   * @param userId ID do usuário
   * @param data Dados da resposta
   * @returns Resultado da validação
   */
  async validateAnswer(userId: number, data: z.infer<typeof submitAnswerSchema>): Promise<any> {
    try {
      const { lessonId, questionId, answer, timeSpent } = data;
      
      // Obtém a lição
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      
      // Encontra a questão
      const questions = lesson.questions as any[];
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        throw new Error("Question not found");
      }
      
      // Verifica se a resposta está correta
      const isCorrect = question.correctAnswer === answer;
      const xpEarned = isCorrect ? 10 : 0;
      
      // Atualiza XP, nível e streak do usuário se a resposta estiver correta
      if (isCorrect && xpEarned > 0) {
        // Atualiza XP e nível
        await userService.updateXpAndLevel(userId, xpEarned);
        
        // Atualiza estatísticas diárias
        const today = new Date().toISOString().split('T')[0];
        await statsService.updateDailyStats(userId, today, { xpEarned });
      }
      
      return {
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned
      };
    } catch (err) {
      error(`Error validating answer for user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Completa uma lição/quiz
   * @param userId ID do usuário
   * @param data Dados de conclusão
   * @returns Progresso atualizado e XP ganho
   */
  async completeQuiz(userId: number, data: z.infer<typeof completeQuizSchema>): Promise<any> {
    try {
      const { lessonId, score, totalQuestions, timeSpent } = data;
      
      // Obtém a lição
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      
      // Calcula a porcentagem de acerto
      const percentage = Math.round((score / totalQuestions) * 100);
      const completed = percentage >= 70; // 70% para passar
      
      // Obtém o progresso existente
      const existingProgress = await storage.getLessonProgress(userId, lessonId);
      const attempts = (existingProgress?.attempts || 0) + 1;
      const wasAlreadyCompleted = existingProgress?.completed || false;
      
      // Atualiza o progresso
      const updatedProgress = await storage.updateProgress(userId, lessonId, {
        completed,
        score: percentage,
        timeSpent,
        attempts,
        lastAttempt: new Date()
      });
      
      // Calcula o XP ganho
      let xpEarned = 0;
      if (completed) {
        const baseXP = lesson.xpReward || 25;
        
        if (!wasAlreadyCompleted) {
          // Primeira conclusão: XP completo baseado na pontuação
          xpEarned = Math.round(baseXP * (percentage / 100));
        } else {
          // Conclusões repetidas: XP decrescente (2 menos por conclusão anterior, mínimo 1)
          const completedAttempts = existingProgress?.attempts || 0;
          const decreaseAmount = 2 * completedAttempts;
          const minXP = 1;
          xpEarned = Math.max(minXP, baseXP - decreaseAmount);
        }
        
        // Atualiza XP e nível do usuário
        await userService.updateXpAndLevel(userId, xpEarned);
        
        // Atualiza estatísticas diárias
        const today = new Date().toISOString().split('T')[0];
        await statsService.updateDailyStats(userId, today, { 
          xpEarned,
          lessonsCompleted: wasAlreadyCompleted ? 0 : 1,
          timeSpent
        });
      }
      
      return {
        progress: updatedProgress,
        xpEarned,
        completed
      };
    } catch (err) {
      error(`Error completing quiz for user ${userId}`, err);
      throw err;
    }
  }
}

// Exporta uma instância singleton do serviço
export const lessonService = new LessonService();

