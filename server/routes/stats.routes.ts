/**
 * Rotas de estatísticas
 * 
 * Este módulo define as rotas relacionadas às estatísticas de usuário,
 * incluindo estatísticas diárias e gerais.
 */

import { Router } from 'express';
import { statsService } from '../services/stats.service';
import { isAuthenticated } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { log, error } from '../utils/logger';
import { z } from 'zod';

const router = Router();

// Schema para validação de parâmetros de query
const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

/**
 * @route GET /api/stats/daily
 * @desc Obtém estatísticas diárias do usuário
 * @access Private
 */
router.get('/daily', isAuthenticated, validateQuery(dateQuerySchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const date = req.query.date as string;
    
    const stats = await statsService.getDailyStats(userId, date);
    
    // Se não houver estatísticas, retorna um objeto vazio
    if (!stats) {
      return res.json({
        userId,
        date,
        lessonsCompleted: 0,
        xpEarned: 0,
        timeSpent: 0
      });
    }
    
    res.json(stats);
  } catch (err) {
    error(`Error fetching daily stats for user ${req.session.userId}`, err);
    res.status(500).json({ message: "Failed to fetch daily stats" });
  }
});

/**
 * @route GET /api/stats/overall
 * @desc Obtém estatísticas gerais do usuário
 * @access Private
 */
router.get('/overall', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const stats = await statsService.getOverallStats(userId);
    
    res.json(stats);
  } catch (err) {
    error(`Error fetching overall stats for user ${req.session.userId}`, err);
    res.status(500).json({ message: "Failed to fetch overall stats" });
  }
});

export default router;

