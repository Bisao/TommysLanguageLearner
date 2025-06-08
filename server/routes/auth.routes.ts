/**
 * Rotas de autenticação
 * 
 * Este módulo define as rotas relacionadas à autenticação de usuários,
 * incluindo login, registro, login como convidado e logout.
 */

import { Router } from 'express';
import { authService, loginSchema, registerSchema } from '../services/auth.service';
import { validateBody } from '../middleware/validation';
import { log, error } from '../utils/logger';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Autentica um usuário
 * @access Public
 */
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await authService.login(username, password);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Armazena o ID do usuário na sessão
    req.session.userId = user.id;
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = authService.sanitizeUser(user);
    
    res.json({ user: sanitizedUser });
  } catch (err) {
    error("Login error", err);
    res.status(500).json({ message: "An error occurred during login" });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Registra um novo usuário
 * @access Public
 */
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const userData = req.body;
    
    // Verifica se o usuário já existe
    const existingUser = await authService.login(userData.username, "");
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Registra o usuário
    const user = await authService.register(userData);
    
    // Armazena o ID do usuário na sessão
    req.session.userId = user.id;
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = authService.sanitizeUser(user);
    
    res.json({ user: sanitizedUser });
  } catch (err) {
    error("Registration error", err);
    
    // Verifica se é um erro de usuário existente
    if (err instanceof Error && err.message === "Username already exists") {
      return res.status(409).json({ message: err.message });
    }
    
    res.status(500).json({ message: "An error occurred during registration" });
  }
});

/**
 * @route POST /api/auth/guest
 * @desc Cria um usuário convidado temporário
 * @access Public
 */
router.post('/guest', async (req, res) => {
  try {
    // Cria um usuário convidado
    const guestUser = await authService.createGuestUser();
    
    // Armazena o ID do usuário na sessão
    req.session.userId = guestUser.id;
    
    // Remove a senha antes de enviar a resposta
    const sanitizedUser = authService.sanitizeUser(guestUser);
    
    res.json({ user: sanitizedUser });
  } catch (err) {
    error("Guest login error", err);
    res.status(500).json({ message: "Failed to create guest account" });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Encerra a sessão do usuário
 * @access Public
 */
router.post('/logout', async (req, res) => {
  try {
    // Destrói a sessão
    req.session.destroy((err) => {
      if (err) {
        throw err;
      }
      res.json({ message: "Logged out successfully" });
    });
  } catch (err) {
    error("Logout error", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

export default router;

