/**
 * Configuração centralizada de rotas
 * 
 * Este módulo registra todas as rotas da API e configura o servidor HTTP.
 */

import { Express } from 'express';
import { createServer, type Server } from 'http';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import lessonRoutes from './lesson.routes';
import statsRoutes from './stats.routes';
import { log } from '../utils/logger';

/**
 * Registra todas as rotas da API
 * @param app Aplicação Express
 * @returns Servidor HTTP
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Cria o servidor HTTP
  const server = createServer(app);
  
  // Registra as rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/stats', statsRoutes);
  
  log('All routes registered successfully');
  
  return server;
}

