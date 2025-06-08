/**
 * Middleware de tratamento de erros
 * 
 * Este módulo fornece um middleware global para capturar e processar erros
 * de forma consistente em toda a aplicação.
 */

import { Request, Response, NextFunction } from 'express';
import { error as logError } from '../utils/logger';

/**
 * Middleware para tratamento global de erros
 * @param err Objeto de erro
 * @param req Requisição Express
 * @param res Resposta Express
 * @param next Função next
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Extrai informações do erro
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log detalhado do erro
  logError(`Error ${status} on ${req.method} ${req.path}: ${message}`, err);
  
  // Resposta de erro para o cliente
  res.status(status).json({ 
    message,
    path: req.path,
    timestamp: new Date().toISOString(),
    // Inclui detalhes adicionais apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details || err.errors || undefined
    })
  });
};

/**
 * Middleware para capturar rotas não encontradas
 * @param req Requisição Express
 * @param res Resposta Express
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logError(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
};

