/**
 * Utilitários de autenticação
 * 
 * Este módulo fornece funções para hash e verificação de senhas,
 * utilizando bcrypt para segurança.
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Gera um hash seguro para uma senha
 * @param password Senha em texto plano
 * @returns Senha com hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compara uma senha em texto plano com um hash
 * @param password Senha em texto plano
 * @param hash Hash armazenado
 * @returns Verdadeiro se a senha corresponder ao hash
 */
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

