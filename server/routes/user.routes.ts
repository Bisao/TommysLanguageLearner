/**
 * Rotas de usuário
 * 
 * Este módulo define as rotas relacionadas ao gerenciamento de usuários,
 * incluindo perfil, check-ins diários e informações de usuário.
 */

import { Router } from 'express';
import { userService, updateProfileSchema } from '../services/user.service';
import { isAuthenticated, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { log, error } from '../utils/logger';

const router = Router();

/**
 * @route GET /api/user
 * @desc Obtém o usuário atual
 * @access Private (com fallback para demo)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = userService.sanitizeUser(user);
    
    res.json(sanitizedUser);
  } catch (err) {
    error("Error fetching user", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/**
 * @route PATCH /api/user/profile
 * @desc Atualiza o perfil do usuário
 * @access Private
 */
router.patch('/profile', isAuthenticated, validateBody(updateProfileSchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const updates = req.body;
    
    const updatedUser = await userService.updateProfile(userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = userService.sanitizeUser(updatedUser);
    
    res.json(sanitizedUser);
  } catch (err) {
    error("Error updating user profile", err);
    
    // Verifica se é um erro de campos inválidos
    if (err instanceof Error && err.message === "No valid fields to update") {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

/**
 * @route POST /api/user/checkin
 * @desc Processa o check-in diário do usuário
 * @access Private
 */
router.post('/checkin', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const result = await userService.processCheckIn(userId);
    
    res.json(result);
  } catch (err) {
    error("Error processing check-in", err);
    
    // Verifica se é um erro de usuário não encontrado
    if (err instanceof Error && err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Failed to process check-in" });
  }
});

/**
 * @route PATCH /api/user
 * @desc Atualiza dados gerais do usuário
 * @access Private
 */
router.patch('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const updates = req.body;
    
    // Atualiza o usuário
    const user = await userService.updateProfile(userId, updates);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = userService.sanitizeUser(user);
    
    res.json(sanitizedUser);
  } catch (err) {
    error("Error updating user", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default router;

