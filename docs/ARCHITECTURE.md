# Arquitetura do TommysAcademy

Este documento descreve em detalhes a arquitetura do sistema TommysAcademy após a refatoração.

## Visão Geral da Arquitetura

O TommysAcademy segue uma arquitetura cliente-servidor com separação clara entre frontend e backend:

```
┌─────────────┐      ┌──────────────────────────────────────┐
│             │      │                                      │
│   Cliente   │◄────►│               Servidor               │
│  (Browser)  │      │                                      │
│             │      │                                      │
└─────────────┘      └──────────────────────────────────────┘
                                      │
                                      │
                                      ▼
                      ┌──────────────────────────────────┐
                      │                                  │
                      │           Banco de Dados         │
                      │                                  │
                      └──────────────────────────────────┘
```

### Frontend (Cliente)

O frontend é uma aplicação React SPA (Single Page Application) que se comunica com o backend via API REST. Ele é responsável pela interface do usuário, interações e experiência do usuário.

### Backend (Servidor)

O backend é uma API REST construída com Express.js e TypeScript. Ele segue uma arquitetura em camadas:

```
┌─────────────────────────────────────────────────────────────────┐
│                           Rotas (API)                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Middlewares                              │
│  (Autenticação, Validação, Tratamento de Erros, Logging, etc.)  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Serviços                               │
│            (Lógica de Negócio e Regras de Domínio)             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Camada de Acesso a Dados                   │
│                 (Armazenamento e Recuperação)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Banco de Dados                          │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes do Backend

### 1. Rotas (Routes)

As rotas definem os endpoints da API e são responsáveis por:
- Receber requisições HTTP
- Validar parâmetros de entrada usando middlewares
- Chamar os serviços apropriados
- Retornar respostas HTTP formatadas

Exemplo:
```typescript
// server/routes/auth.routes.ts
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authService.login(username, password);
    // ...
    res.json({ user: sanitizedUser });
  } catch (err) {
    // ...
  }
});
```

### 2. Middlewares

Os middlewares são funções que processam requisições antes que elas cheguem aos manipuladores de rota. Eles são responsáveis por:
- Autenticação e autorização
- Validação de entrada
- Tratamento de erros
- Logging
- Configurações de segurança

Exemplo:
```typescript
// server/middleware/validation.ts
export const validateBody = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (err) {
      // ...
    }
  };
```

### 3. Serviços (Services)

Os serviços contêm a lógica de negócio da aplicação e são responsáveis por:
- Implementar regras de negócio
- Coordenar operações entre diferentes entidades
- Chamar a camada de acesso a dados
- Transformar dados entre a API e o banco de dados

Exemplo:
```typescript
// server/services/auth.service.ts
async login(username: string, password: string): Promise<User | null> {
  try {
    log(`Login attempt for username: ${username}`);
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      log(`User not found: ${username}`);
      return null;
    }
    
    const isPasswordValid = await comparePasswords(password, user.password);
    // ...
  } catch (err) {
    // ...
  }
}
```

### 4. Camada de Acesso a Dados (Storage)

A camada de acesso a dados é responsável por:
- Abstrair o acesso ao banco de dados
- Fornecer operações CRUD para entidades
- Mapear entre objetos de domínio e representações de banco de dados

Exemplo:
```typescript
// server/storage.ts
async getUser(id: number): Promise<User | undefined> {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  } catch (err) {
    error(`Error fetching user ${id}`, err);
    throw err;
  }
}
```

### 5. Utilitários (Utils)

Os utilitários são funções auxiliares que:
- Fornecem funcionalidades comuns
- Encapsulam lógica reutilizável
- Simplificam operações complexas

Exemplo:
```typescript
// server/utils/streak.ts
export const calculateNewStreak = (
  lastActiveDate: string | null, 
  currentStreak: number
): { newStreak: number; lastActiveDate: string } => {
  // ...
};
```

## Fluxo de Dados

1. **Requisição HTTP**: O cliente envia uma requisição HTTP para um endpoint da API.
2. **Middlewares**: A requisição passa por middlewares globais (segurança, logging, etc.).
3. **Rota**: A rota correspondente recebe a requisição.
4. **Validação**: Middlewares de validação verificam os dados de entrada.
5. **Serviço**: O serviço apropriado é chamado para processar a requisição.
6. **Acesso a Dados**: O serviço utiliza a camada de acesso a dados para interagir com o banco de dados.
7. **Resposta**: O resultado é formatado e retornado ao cliente.

## Padrões de Design Utilizados

### 1. Injeção de Dependência

Os serviços recebem suas dependências (como a camada de acesso a dados) em vez de criá-las internamente, facilitando testes e substituições.

### 2. Singleton

Serviços são exportados como instâncias únicas para garantir consistência e compartilhamento de estado quando necessário.

### 3. Repository Pattern

A camada de acesso a dados implementa o padrão Repository, abstraindo o acesso ao banco de dados e permitindo múltiplas implementações (memória, banco de dados).

### 4. Middleware Chain

Express utiliza o padrão de cadeia de middlewares para processar requisições sequencialmente.

### 5. Service Layer

A lógica de negócio é encapsulada em serviços, separando-a das rotas e do acesso a dados.

## Considerações de Segurança

1. **Autenticação**: Sessões seguras com armazenamento em PostgreSQL.
2. **Validação de Entrada**: Validação rigorosa usando Zod.
3. **Proteção contra Ataques Comuns**: Helmet para cabeçalhos HTTP seguros.
4. **Rate Limiting**: Proteção contra ataques de força bruta.
5. **CORS**: Configuração segura para comunicação cross-origin.
6. **Sanitização de Saída**: Remoção de dados sensíveis antes de enviar respostas.

## Escalabilidade

A arquitetura foi projetada para escalar horizontalmente:

1. **Separação de Responsabilidades**: Facilita a distribuição de componentes em diferentes servidores.
2. **Stateless**: O backend é stateless, permitindo múltiplas instâncias.
3. **Conexões de Banco de Dados**: Pool de conexões configurável para otimizar o uso de recursos.
4. **Caching**: Estratégias de cache implementadas para reduzir carga no banco de dados.

## Observabilidade

1. **Logging**: Sistema de logging centralizado com diferentes níveis.
2. **Monitoramento de Requisições**: Logging de duração e status de requisições API.
3. **Tratamento de Erros**: Captura e registro consistente de erros.

## Conclusão

A arquitetura refatorada do TommysAcademy segue princípios modernos de desenvolvimento de software, com foco em modularidade, manutenibilidade e escalabilidade. A separação clara de responsabilidades e a estrutura organizada facilitam o desenvolvimento contínuo e a integração com agentes de IA.

