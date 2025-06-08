# TommysAcademy

Uma plataforma de aprendizado de idiomas gamificada, projetada para tornar o aprendizado de inglês divertido e eficaz.

## Visão Geral

TommysAcademy é uma aplicação web moderna para aprendizado de idiomas que utiliza técnicas de gamificação para engajar os usuários. A plataforma oferece lições interativas, exercícios de gramática, vocabulário, pronúncia e muito mais, tudo em um ambiente amigável e motivador.

## Arquitetura

O projeto segue uma arquitetura moderna e robusta, dividida em frontend e backend:

### Frontend

- **Framework**: React com TypeScript
- **Estilização**: TailwindCSS
- **Roteamento**: Wouter
- **Gerenciamento de Estado**: React Query
- **Componentes UI**: Radix UI + Shadcn/UI

### Backend

- **Framework**: Express.js com TypeScript
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Autenticação**: Express Session com armazenamento PostgreSQL
- **Validação**: Zod
- **Segurança**: Helmet, Rate Limiting, CORS

## Nova Estrutura de Diretórios

A refatoração organizou o código em uma estrutura mais modular e escalável:

```
server/
├── index.ts              # Ponto de entrada principal
├── config/               # Configurações e variáveis de ambiente
│   └── index.ts
├── db/                   # Configuração do banco de dados
│   └── index.ts
├── middleware/           # Middlewares Express
│   ├── auth.ts           # Middleware de autenticação
│   ├── validation.ts     # Middleware de validação
│   ├── error-handler.ts  # Middleware de tratamento de erros
│   └── index.ts
├── models/               # Definições de modelos/tipos
│   └── index.ts
├── routes/               # Definições de rotas
│   ├── auth.routes.ts    # Rotas de autenticação
│   ├── user.routes.ts    # Rotas de usuário
│   ├── lesson.routes.ts  # Rotas de lições
│   ├── stats.routes.ts   # Rotas de estatísticas
│   └── index.ts
├── services/             # Lógica de negócio
│   ├── auth.service.ts   # Serviço de autenticação
│   ├── user.service.ts   # Serviço de usuário
│   ├── lesson.service.ts # Serviço de lições
│   ├── stats.service.ts  # Serviço de estatísticas
│   └── index.ts
├── utils/                # Funções utilitárias
│   ├── auth.ts           # Utilitários de autenticação
│   ├── streak.ts         # Cálculo de sequências diárias
│   ├── logger.ts         # Utilitário de logging
│   └── index.ts
└── vite.ts               # Configuração do Vite
```

## Melhorias Implementadas

### 1. Modularização e Separação de Responsabilidades

- **Antes**: Código monolítico com lógica de negócio misturada com manipuladores de rotas.
- **Depois**: Separação clara entre rotas, serviços e acesso a dados, seguindo o princípio de responsabilidade única.

### 2. Validação Consistente

- **Antes**: Validação inconsistente e duplicada em vários pontos.
- **Depois**: Sistema de validação centralizado usando Zod e middlewares reutilizáveis.

### 3. Tratamento de Erros Aprimorado

- **Antes**: Tratamento de erros ad-hoc em cada rota.
- **Depois**: Middleware global de tratamento de erros com respostas padronizadas e logging detalhado.

### 4. Abstração de Banco de Dados Melhorada

- **Antes**: Implementação parcial da camada de acesso a dados.
- **Depois**: Interface completa com implementações para memória e banco de dados.

### 5. Logging Centralizado

- **Antes**: Uso inconsistente de console.log/error.
- **Depois**: Sistema de logging centralizado com níveis e formatação consistente.

### 6. Documentação Abrangente

- **Antes**: Documentação mínima ou ausente.
- **Depois**: Comentários JSDoc detalhados, README abrangente e documentação de API.

### 7. Segurança Aprimorada

- **Antes**: Configurações básicas de segurança.
- **Depois**: Implementação robusta com Helmet, rate limiting, validação de entrada e sanitização de saída.

## Benefícios para Futuros Agentes de IA

A nova arquitetura foi projetada para facilitar a integração e colaboração com agentes de IA:

1. **Estrutura Previsível**: Organização clara e consistente facilita a navegação e compreensão do código.

2. **Documentação Rica**: Comentários JSDoc detalhados ajudam agentes de IA a entender o propósito e uso de cada componente.

3. **Interfaces Bem Definidas**: Interfaces claras entre camadas permitem que agentes de IA entendam as dependências e fluxos de dados.

4. **Validação Explícita**: Schemas Zod fornecem informações claras sobre a estrutura de dados esperada.

5. **Tratamento de Erros Consistente**: Padrões de tratamento de erros facilitam a depuração e manutenção.

6. **Logging Informativo**: Sistema de logging detalhado ajuda na observabilidade e diagnóstico.

## Configuração e Execução

### Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL (opcional, pode usar o modo de memória para desenvolvimento)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/tommysacademy.git
   cd tommysacademy
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   # Crie um arquivo .env na raiz do projeto
   SESSION_SECRET=seu_segredo_aqui
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/tommysacademy
   ```

### Execução

#### Desenvolvimento

```bash
npm run dev
```

#### Produção

```bash
npm run build
npm run start
```

## URLs de Acesso

- **- Frontend: https://skldgnuv.manus.space
- **Backend API**: [https://5000-iucx5lvmzd0uhg5qou4om-ce882bbe.manusvm.computer](https://5000-iucx5lvmzd0uhg5qou4om-ce882bbe.manusvm.computer)

## Conclusão

A refatoração do TommysAcademy transformou o projeto em uma aplicação mais robusta, manutenível e profissional. A nova arquitetura não apenas melhora a qualidade do código, mas também facilita futuras expansões e integrações com agentes de IA, garantindo que o projeto possa evoluir de forma sustentável.

---

Desenvolvido com ❤️ por Manus AI

