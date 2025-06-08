/**
 * Configuração do banco de dados
 * 
 * Este módulo configura a conexão com o banco de dados usando Neon Serverless
 * e inicializa o Drizzle ORM com o schema compartilhado.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import config from '../config';
import { error } from '../utils/logger';

// Configuração do WebSocket para Neon Serverless
neonConfig.webSocketConstructor = ws;

// Verifica se a URL do banco de dados está definida
if (!config.DATABASE_URL) {
  error("DATABASE_URL must be set. Did you forget to provision a database?");
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Cria o pool de conexões
export const pool = new Pool({ 
  connectionString: config.DATABASE_URL,
  max: 10, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo de inatividade
  connectionTimeoutMillis: 5000 // Tempo máximo para estabelecer conexão
});

// Inicializa o Drizzle ORM
export const db = drizzle({ client: pool, schema });

// Função para testar a conexão com o banco de dados
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (err) {
    error("Failed to connect to database", err);
    return false;
  }
};

