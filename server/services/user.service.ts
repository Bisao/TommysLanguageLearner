/**
 * Serviço de usuário
 * 
 * Este módulo fornece serviços relacionados ao gerenciamento de usuários,
 * incluindo perfil, check-ins diários e atualizações de XP/nível.
 */

import { storage } from '../storage';
import { calculateNewStreak } from '../utils/streak';
import { log, error } from '../utils/logger';
import { User, UserWithoutPassword } from '../models';
import { z } from 'zod';

// Schema de validação para atualização de perfil
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  dailyGoal: z.number().min(1).max(100).optional(),
});

export class UserService {
  /**
   * Obtém um usuário pelo ID
   * @param userId ID do usuário
   * @returns Usuário ou null se não encontrado
   */
  async getUser(userId: number): Promise<User | null> {
    try {
      const user = await storage.getUser(userId);
      return user || null;
    } catch (err) {
      error(`Error fetching user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Atualiza o perfil de um usuário
   * @param userId ID do usuário
   * @param updates Campos a serem atualizados
   * @returns Usuário atualizado ou null se não encontrado
   */
  async updateProfile(userId: number, updates: z.infer<typeof updateProfileSchema>): Promise<User | null> {
    try {
      // Filtra apenas os campos permitidos
      const allowedFields = ['username', 'email', 'dailyGoal'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key as keyof typeof updates];
          return obj;
        }, {} as Partial<User>);
      
      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error("No valid fields to update");
      }
      
      // Verifica se o usuário existe
      const user = await storage.getUser(userId);
      if (!user) {
        return null;
      }
      
      // Atualiza o usuário
      const updatedUser = await storage.updateUser(userId, filteredUpdates);
      log(`User ${userId} profile updated: ${JSON.stringify(filteredUpdates)}`);
      
      return updatedUser || null;
    } catch (err) {
      error(`Error updating user ${userId} profile`, err);
      throw err;
    }
  }
  
  /**
   * Processa o check-in diário de um usuário e atualiza a sequência
   * @param userId ID do usuário
   * @returns Objeto com a sequência atualizada e a data de última atividade
   */
  async processCheckIn(userId: number): Promise<{ streak: number; lastActiveDate: string; user: UserWithoutPassword }> {
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Calcula a nova sequência
      const { newStreak, lastActiveDate } = calculateNewStreak(
        user.lastActiveDate || null,
        user.streak || 0
      );
      
      // Atualiza o usuário apenas se houver mudança na sequência
      if (newStreak !== user.streak || lastActiveDate !== user.lastActiveDate) {
        const updatedUser = await storage.updateUser(userId, {
          streak: newStreak,
          lastActiveDate
        });
        
        if (!updatedUser) {
          throw new Error("Failed to update user streak");
        }
        
        log(`User ${userId} streak updated to ${newStreak}`);
        
        // Remove a senha antes de retornar
        const { password, ...userWithoutPassword } = updatedUser;
        
        return {
          streak: newStreak,
          lastActiveDate,
          user: userWithoutPassword
        };
      }
      
      // Se não houve mudança, retorna os valores atuais
      const { password, ...userWithoutPassword } = user;
      
      return {
        streak: user.streak || 0,
        lastActiveDate: user.lastActiveDate || lastActiveDate,
        user: userWithoutPassword
      };
    } catch (err) {
      error(`Error processing check-in for user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Atualiza o XP e nível de um usuário
   * @param userId ID do usuário
   * @param xpEarned XP ganho
   * @returns Usuário atualizado ou null se não encontrado
   */
  async updateXpAndLevel(userId: number, xpEarned: number): Promise<User | null> {
    try {
      if (xpEarned <= 0) {
        return await this.getUser(userId);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return null;
      }
      
      // Calcula o novo XP total e nível
      const newTotalXP = (user.totalXP || 0) + xpEarned;
      const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
      
      // Atualiza o usuário
      const updatedUser = await storage.updateUser(userId, {
        totalXP: newTotalXP,
        level: newLevel
      });
      
      log(`User ${userId} earned ${xpEarned} XP, new total: ${newTotalXP}, level: ${newLevel}`);
      
      return updatedUser || null;
    } catch (err) {
      error(`Error updating XP for user ${userId}`, err);
      throw err;
    }
  }
  
  /**
   * Remove informações sensíveis do objeto de usuário
   * @param user Objeto de usuário completo
   * @returns Objeto de usuário sem senha
   */
  sanitizeUser(user: User): UserWithoutPassword {
    // Desestrutura o objeto para remover a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Exporta uma instância singleton do serviço
export const userService = new UserService();

