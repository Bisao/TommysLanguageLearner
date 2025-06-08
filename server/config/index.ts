/**
 * Configuração do ambiente da aplicação
 * 
 * Este arquivo centraliza a validação e exportação das variáveis de ambiente
 * necessárias para o funcionamento da aplicação.
 */

interface EnvConfig {
  SESSION_SECRET: string;
  DATABASE_URL: string;
  NODE_ENV: string;
  PORT: number;
}

const config: EnvConfig = {
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
};

// Validar variáveis de ambiente críticas
const requiredEnvVars: (keyof EnvConfig)[] = ['SESSION_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !config[envVar]);

if (missingEnvVars.length > 0 && config.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these environment variables before starting the application');
  process.exit(1);
}

export default config;

