/**
 * Serviço de estatísticas
 * 
 * Este módulo fornece serviços relacionados ao gerenciamento de estatísticas
 * de usuário, incluindo estatísticas diárias e gerais.
 */

import { storage } from '../storage';
import { log, error } from '../utils/logger';
import { UserStats } from '../models';

export class StatsService {
  /**
   * Obtém estatísticas diárias de um usuário
   * @param userId ID do usuário
   * @param date Data no formato YYYY-MM-DD
   * @returns Estatísticas do dia ou objeto vazio se não encontradas
   */
  async getDailyStats(userId: number, date: string): Promise<UserStats | null> {
    try {
      const stats = await storage.getUserStats(userId, date);
      return stats || null;
    } catch (err) {
      error(`Error fetching daily stats for user ${userId} on ${date}`, err);
      throw err;
    }
  }
  
  /**
   * Atualiza estatísticas diárias de um usuário
   * @param userId ID do usuário
   * @param date Data no formato YYYY-MM-DD
   * @param updates Campos a serem atualizados
   * @returns Estatísticas atualizadas
   */
  async updateDailyStats(userId: number, date: string, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      // Obtém estatísticas existentes
      const existingStats = await storage.getUserStats(userId, date);
      
      // Prepara as atualizações
      const statsUpdates: Partial<UserStats> = {};
      
      // Atualiza XP ganho
      if (updates.xpEarned && updates.xpEarned > 0) {
        statsUpdates.xpEarned = (existingStats?.xpEarned || 0) + updates.xpEarned;
      }
      
      // Atualiza lições completadas
      if (updates.lessonsCompleted && updates.lessonsCompleted > 0) {
        statsUpdates.lessonsCompleted = (existingStats?.lessonsCompleted || 0) + updates.lessonsCompleted;
      }
      
      // Atualiza tempo gasto
      if (updates.timeSpent && updates.timeSpent > 0) {
        statsUpdates.timeSpent = (existingStats?.timeSpent || 0) + updates.timeSpent;
      }
      
      // Atualiza as estatísticas
      const updatedStats = await storage.updateStats(userId, date, statsUpdates);
      
      log(`Updated daily stats for user ${userId} on ${date}: ${JSON.stringify(statsUpdates)}`);
      
      return updatedStats;
    } catch (err) {
      error(`Error updating daily stats for user ${userId} on ${date}`, err);
      throw err;
    }
  }
  
  /**
   * Obtém estatísticas gerais de um usuário
   * @param userId ID do usuário
   * @returns Estatísticas gerais
   */
  async getOverallStats(userId: number): Promise<any> {
    try {
      return await storage.getUserOverallStats(userId);
    } catch (err) {
      error(`Error fetching overall stats for user ${userId}`, err);
      throw err;
    }
  }
}

// Exporta uma instância singleton do serviço
export const statsService = new StatsService();

