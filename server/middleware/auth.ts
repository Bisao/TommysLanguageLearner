/**
 * Middleware de autenticação
 * 
 * Este módulo fornece middlewares para verificar a autenticação do usuário
 * e proteger rotas que requerem login.
 */

import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Interface para estender a sessão do Express com userId
 */
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

/**
 * Middleware que verifica se o usuário está autenticado
 * @param req Requisição Express
 * @param res Resposta Express
 * @param next Função next
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    next();
  } else {
    log(`Unauthorized access attempt to ${req.path}`);
    res.status(401).json({ message: 'Unauthorized. Please login to continue.' });
  }
};

/**
 * Middleware que permite acesso mesmo sem autenticação, mas com fallback para userId=1
 * Útil para demonstração e desenvolvimento
 * @param req Requisição Express
 * @param res Resposta Express
 * @param next Função next
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    // Fallback para usuário demo em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      req.session.userId = 1;
      log('Using demo user (ID: 1) for unauthenticated request');
    }
  }
  next();
};

