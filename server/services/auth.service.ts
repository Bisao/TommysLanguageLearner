/**
 * Serviço de autenticação
 * 
 * Este módulo fornece serviços relacionados à autenticação de usuários,
 * incluindo login, registro e gerenciamento de sessões.
 */

import { storage } from '../storage';
import { hashPassword, comparePasswords } from '../utils/auth';
import { log, error } from '../utils/logger';
import { User, InsertUser, UserWithoutPassword } from '../models';
import { z } from 'zod';

// Schema de validação para login
export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Schema de validação para registro
export const registerSchema = z.object({
  username: z.string()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
    .max(20, "Nome de usuário deve ter no máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Nome de usuário deve conter apenas letras, números e underscores"),
  email: z.string().email("Email deve ter formato válido"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
});

export class AuthService {
  /**
   * Autentica um usuário com nome de usuário e senha
   * @param username Nome de usuário
   * @param password Senha
   * @returns Usuário autenticado ou null se falhar
   */
  async login(username: string, password: string): Promise<User | null> {
    try {
      log(`Login attempt for username: ${username}`);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        log(`User not found: ${username}`);
        return null;
      }
      
      const isPasswordValid = await comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        log(`Invalid password for user: ${username}`);
        return null;
      }
      
      log(`Authentication successful for username: ${username}`);
      return user;
    } catch (err) {
      error(`Error during login for ${username}`, err);
      throw err;
    }
  }
  
  /**
   * Registra um novo usuário
   * @param userData Dados do usuário
   * @returns Usuário criado
   */
  async register(userData: z.infer<typeof registerSchema>): Promise<User> {
    try {
      // Verifica se o usuário já existe
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error("Username already exists");
      }
      
      // Cria o usuário
      const user = await storage.createUser(userData);
      log(`New user registered: ${userData.username}`);
      
      return user;
    } catch (err) {
      error(`Error during registration for ${userData.username}`, err);
      throw err;
    }
  }
  
  /**
   * Cria um usuário convidado temporário
   * @returns Usuário convidado criado
   */
  async createGuestUser(): Promise<User> {
    try {
      // Gera um nome de usuário único para o convidado
      const timestamp = Date.now();
      const guestUsername = `guest_${timestamp}`;
      
      // Cria um usuário convidado temporário
      const guestUser = await storage.createUser({
        username: guestUsername,
        email: `${guestUsername}@guest.local`,
        password: `guest_password_${timestamp}`
      });
      
      log(`Guest user created: ${guestUsername}`);
      return guestUser;
    } catch (err) {
      error("Error creating guest user", err);
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
export const authService = new AuthService();

