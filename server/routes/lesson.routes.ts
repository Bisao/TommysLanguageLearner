/**
 * Rotas de lições
 * 
 * Este módulo define as rotas relacionadas ao gerenciamento de lições,
 * incluindo listagem, detalhes, submissão de respostas e conclusão.
 */

import { Router } from 'express';
import { lessonService, submitAnswerSchema, completeQuizSchema } from '../services/lesson.service';
import { isAuthenticated, optionalAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { log, error } from '../utils/logger';
import { z } from 'zod';

const router = Router();

// Schema para validação de parâmetros de rota
const lessonIdSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0, {
    message: "Lesson ID must be a positive integer"
  })
});

// Schema para validação de parâmetros de query
const categoryQuerySchema = z.object({
  category: z.string().optional()
});

/**
 * @route GET /api/lessons
 * @desc Obtém todas as lições ou lições por categoria
 * @access Private (com fallback para demo)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const category = req.query.category as string | undefined;
    
    const lessonsWithProgress = await lessonService.getLessonsWithProgress(userId, category);
    
    res.json(lessonsWithProgress);
  } catch (err) {
    error("Error fetching lessons", err);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
});

/**
 * @route GET /api/lessons/:id
 * @desc Obtém uma lição específica
 * @access Private (com fallback para demo)
 */
router.get('/:id', optionalAuth, validateParams(lessonIdSchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const lessonId = parseInt(req.params.id, 10);
    
    const lessonWithProgress = await lessonService.getLessonWithProgress(userId, lessonId);
    
    if (!lessonWithProgress) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.json(lessonWithProgress);
  } catch (err) {
    error(`Error fetching lesson ${req.params.id}`, err);
    res.status(500).json({ message: "Failed to fetch lesson" });
  }
});

/**
 * @route POST /api/lessons/answer
 * @desc Valida uma resposta de exercício
 * @access Private
 */
router.post('/answer', isAuthenticated, validateBody(submitAnswerSchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const answerData = req.body;
    
    const result = await lessonService.validateAnswer(userId, answerData);
    
    res.json(result);
  } catch (err) {
    error("Error validating answer", err);
    
    // Verifica erros específicos
    if (err instanceof Error) {
      if (err.message === "Lesson not found") {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === "Question not found") {
        return res.status(404).json({ message: err.message });
      }
    }
    
    res.status(500).json({ message: "Failed to validate answer" });
  }
});

/**
 * @route POST /api/lessons/complete
 * @desc Completa uma lição/quiz
 * @access Private
 */
router.post('/complete', isAuthenticated, validateBody(completeQuizSchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const quizData = req.body;
    
    const result = await lessonService.completeQuiz(userId, quizData);
    
    res.json(result);
  } catch (err) {
    error("Error completing quiz", err);
    
    // Verifica erros específicos
    if (err instanceof Error && err.message === "Lesson not found") {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Failed to complete quiz" });
  }
});

export default router;

