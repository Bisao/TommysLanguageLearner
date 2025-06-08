/**
 * Ponto de entrada principal do servidor
 * 
 * Este módulo configura e inicia o servidor Express, incluindo middlewares,
 * sessão, segurança e rotas.
 */

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { pool } from "./db";
import { errorHandler, notFoundHandler } from "./middleware";
import { log, error } from "./utils/logger";
import config from "./config";

// Inicializa a aplicação Express
const app = express();

// Configuração de proxy para rate limiting
app.set("trust proxy", 1);

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://5000-iucx5lvmzd0uhg5qou4om-ce882bbe.manusvm.computer", "https://sayqcibv.manus.space"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Middleware de CORS
app.use(cors({
  origin: true, // Permite todas as origens em desenvolvimento
  credentials: true, // Permite cookies em requisições cross-origin
}));

// Middleware de cache
app.use((req, res, next) => {
  // Cache para assets estáticos (1 hora)
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader("Cache-Control", "public, max-age=3600, immutable");
  }
  // Cache para respostas de API de lições e progresso (5 minutos com revalidação)
  else if (req.url.startsWith("/api/lessons") || req.url.startsWith("/api/progress")) {
    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
  }
  // Cache para dados de usuário (1 minuto com revalidação)
  else if (req.url.startsWith("/api/user")) {
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
  }
  // Sem cache para outros endpoints da API
  else if (req.url.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 requisições de autenticação por IP
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/", authLimiter);
app.use("/api/", limiter);

// Configuração de sessão
const PgSession = ConnectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
  },
}));

// Middleware de parsing de corpo
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Intercepta a resposta para logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    const duration = Date.now() - start;
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Limita o tamanho do log
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      
      log(logLine);
    }
    
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  
  next();
});

// Função principal de inicialização
(async () => {
  try {
    // Executar migração de usuários em desenvolvimento
    if (config.NODE_ENV === "development") {
      try {
        const { migrateExistingUsers } = await import("./migrate-users");
        await migrateExistingUsers();
        log("User migration completed successfully");
        
        // Executar seed do banco de dados
        const { seedDatabase } = await import("./seed-data");
        await seedDatabase();
        log("Database seeding completed successfully");
      } catch (err) {
        error("Error during development setup", err);
      }
    }
    
    // Registra as rotas da API
    const server = await registerRoutes(app);
    
    // Middleware de tratamento de erros global
    app.use(errorHandler);
    
    // Middleware para rotas não encontradas
    app.use(notFoundHandler);
    
    // Configuração do Vite em desenvolvimento
    if (config.NODE_ENV === "development") {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { 
          middlewareMode: true,
          hmr: {
            port: 24678,
            host: '0.0.0.0'
          }
        },
      });
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
    } else {
      // Serve arquivos estáticos em produção
      serveStatic(app);
    }
    
    // Inicia o servidor
    server.listen({
      port: config.PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (err) {
    error("Failed to start server", err);
    process.exit(1);
  }
})();


