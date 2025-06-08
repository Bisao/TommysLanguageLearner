/**
 * Middleware de validação de requisições
 * 
 * Este módulo fornece um middleware para validação de dados de entrada
 * utilizando schemas Zod, garantindo que os dados recebidos estejam
 * no formato esperado antes de serem processados.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { error } from '../utils/logger';

/**
 * Middleware que valida o corpo da requisição contra um schema Zod
 * @param schema Schema Zod para validação
 * @returns Middleware Express
 */
export const validateBody = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        error('Validation error', err);
        return res.status(400).json({
          message: 'Validation failed',
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(err); // Passa outros erros para o handler global
    }
  };

/**
 * Middleware que valida parâmetros de rota contra um schema Zod
 * @param schema Schema Zod para validação
 * @returns Middleware Express
 */
export const validateParams = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        error('Validation error in params', err);
        return res.status(400).json({
          message: 'Invalid parameters',
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(err);
    }
  };

/**
 * Middleware que valida parâmetros de query string contra um schema Zod
 * @param schema Schema Zod para validação
 * @returns Middleware Express
 */
export const validateQuery = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        error('Validation error in query', err);
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(err);
    }
  };

