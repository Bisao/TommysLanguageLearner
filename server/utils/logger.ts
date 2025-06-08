/**
 * Utilitário de logging centralizado
 * 
 * Este módulo fornece funções para logging consistente em toda a aplicação,
 * facilitando a observabilidade e depuração.
 */

/**
 * Registra uma mensagem informativa
 * @param message Mensagem a ser registrada
 */
export const log = (message: string): void => {
  console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
};

/**
 * Registra uma mensagem de erro
 * @param message Mensagem de erro
 * @param err Objeto de erro opcional
 */
export const error = (message: string, err?: any): void => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, err || '');
};

/**
 * Registra uma mensagem de aviso
 * @param message Mensagem de aviso
 */
export const warn = (message: string): void => {
  console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
};

/**
 * Registra uma mensagem de depuração
 * @param message Mensagem de depuração
 */
export const debug = (message: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
  }
};

