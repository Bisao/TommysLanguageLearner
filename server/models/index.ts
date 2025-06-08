/**
 * Exportação centralizada de modelos
 * 
 * Este arquivo re-exporta todos os modelos do schema compartilhado
 * e define tipos adicionais específicos do servidor, se necessário.
 */

// Re-exporta o schema compartilhado
export * from '@shared/schema';

// Tipos adicionais específicos do servidor
export interface UserWithoutPassword {
  id: number;
  username: string;
  email: string;
  streak?: number;
  totalXP?: number;
  level?: number;
  dailyGoal?: number;
  lastActiveDate?: string | null;
  achievements?: string[];
  createdAt: Date;
}

export interface AuthResponse {
  user: UserWithoutPassword;
}

export interface ErrorResponse {
  message: string;
  path?: string;
  timestamp?: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

