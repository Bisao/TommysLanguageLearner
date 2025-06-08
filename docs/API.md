# Documentação da API TommysAcademy

Esta documentação descreve os endpoints da API REST do TommysAcademy, seus parâmetros, respostas e exemplos de uso.

## Índice

1. [Autenticação](#autenticação)
   - [Login](#login)
   - [Registro](#registro)
   - [Login como Convidado](#login-como-convidado)
   - [Logout](#logout)
2. [Usuário](#usuário)
   - [Obter Usuário Atual](#obter-usuário-atual)
   - [Atualizar Perfil](#atualizar-perfil)
   - [Check-in Diário](#check-in-diário)
3. [Lições](#lições)
   - [Listar Lições](#listar-lições)
   - [Obter Lição](#obter-lição)
   - [Submeter Resposta](#submeter-resposta)
   - [Completar Lição](#completar-lição)
4. [Estatísticas](#estatísticas)
   - [Estatísticas Diárias](#estatísticas-diárias)
   - [Estatísticas Gerais](#estatísticas-gerais)

## Autenticação

### Login

Autentica um usuário com nome de usuário e senha.

**URL**: `/api/auth/login`

**Método**: `POST`

**Autenticação**: Não

**Corpo da Requisição**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "user": {
    "id": 1,
    "username": "learner",
    "email": "learner@example.com",
    "streak": 7,
    "totalXP": 1250,
    "level": 5,
    "dailyGoal": 15,
    "lastActiveDate": "2025-06-07",
    "achievements": ["first_lesson", "week_warrior"],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Resposta de Erro**:
- **Código**: `401 Unauthorized`
- **Conteúdo**:
```json
{
  "message": "Invalid credentials"
}
```

### Registro

Registra um novo usuário.

**URL**: `/api/auth/register`

**Método**: `POST`

**Autenticação**: Não

**Corpo da Requisição**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "streak": 0,
    "totalXP": 0,
    "level": 1,
    "dailyGoal": 15,
    "lastActiveDate": null,
    "achievements": [],
    "createdAt": "2025-06-07T00:00:00.000Z"
  }
}
```

**Resposta de Erro**:
- **Código**: `409 Conflict`
- **Conteúdo**:
```json
{
  "message": "Username already exists"
}
```

### Login como Convidado

Cria um usuário convidado temporário.

**URL**: `/api/auth/guest`

**Método**: `POST`

**Autenticação**: Não

**Corpo da Requisição**: Nenhum

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "user": {
    "id": 3,
    "username": "guest_1717185476123",
    "email": "guest_1717185476123@guest.local",
    "streak": 0,
    "totalXP": 0,
    "level": 1,
    "dailyGoal": 15,
    "lastActiveDate": null,
    "achievements": [],
    "createdAt": "2025-06-07T00:00:00.000Z"
  }
}
```

### Logout

Encerra a sessão do usuário.

**URL**: `/api/auth/logout`

**Método**: `POST`

**Autenticação**: Sim

**Corpo da Requisição**: Nenhum

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "message": "Logged out successfully"
}
```

## Usuário

### Obter Usuário Atual

Obtém informações do usuário atual.

**URL**: `/api/user`

**Método**: `GET`

**Autenticação**: Sim

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "id": 1,
  "username": "learner",
  "email": "learner@example.com",
  "streak": 7,
  "totalXP": 1250,
  "level": 5,
  "dailyGoal": 15,
  "lastActiveDate": "2025-06-07",
  "achievements": ["first_lesson", "week_warrior"],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Resposta de Erro**:
- **Código**: `404 Not Found`
- **Conteúdo**:
```json
{
  "message": "User not found"
}
```

### Atualizar Perfil

Atualiza informações do perfil do usuário.

**URL**: `/api/user/profile`

**Método**: `PATCH`

**Autenticação**: Sim

**Corpo da Requisição**:
```json
{
  "username": "string",
  "email": "string",
  "dailyGoal": 20
}
```

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "id": 1,
  "username": "learner_updated",
  "email": "learner_new@example.com",
  "streak": 7,
  "totalXP": 1250,
  "level": 5,
  "dailyGoal": 20,
  "lastActiveDate": "2025-06-07",
  "achievements": ["first_lesson", "week_warrior"],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Check-in Diário

Processa o check-in diário do usuário e atualiza a sequência.

**URL**: `/api/user/checkin`

**Método**: `POST`

**Autenticação**: Sim

**Corpo da Requisição**: Nenhum

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "streak": 8,
  "lastActiveDate": "2025-06-07",
  "user": {
    "id": 1,
    "username": "learner",
    "email": "learner@example.com",
    "streak": 8,
    "totalXP": 1250,
    "level": 5,
    "dailyGoal": 15,
    "lastActiveDate": "2025-06-07",
    "achievements": ["first_lesson", "week_warrior"],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Lições

### Listar Lições

Obtém todas as lições ou lições por categoria.

**URL**: `/api/lessons`

**Método**: `GET`

**Autenticação**: Opcional

**Parâmetros de Query**:
- `category` (opcional): Categoria das lições (ex: "grammar", "vocabulary")

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
[
  {
    "id": 1,
    "title": "Food Trends 2021 - Simple Present",
    "description": "Learn about food trends and master Simple Present tense",
    "category": "grammar",
    "level": 1,
    "xpReward": 25,
    "order": 1,
    "isLocked": false,
    "questions": [...],
    "completed": true,
    "score": 85,
    "attempts": 1
  },
  {
    "id": 2,
    "title": "Tom Hanks Movie - Simple Past",
    "description": "Learn about acting and master Simple Past tense",
    "category": "grammar",
    "level": 2,
    "xpReward": 25,
    "order": 2,
    "isLocked": false,
    "questions": [...],
    "completed": false,
    "score": 0,
    "attempts": 0
  }
]
```

### Obter Lição

Obtém uma lição específica.

**URL**: `/api/lessons/:id`

**Método**: `GET`

**Autenticação**: Opcional

**Parâmetros de URL**:
- `id`: ID da lição

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "id": 1,
  "title": "Food Trends 2021 - Simple Present",
  "description": "Learn about food trends and master Simple Present tense",
  "category": "grammar",
  "level": 1,
  "xpReward": 25,
  "order": 1,
  "isLocked": false,
  "questions": [
    {
      "id": "1",
      "type": "multiple_choice",
      "question": "What does 'trend' mean?",
      "options": ["tendência", "garrafa", "verão", "mundo"],
      "correctAnswer": "tendência",
      "explanation": "A 'trend' is a tendência - a general direction in which something is developing or changing."
    },
    // ... mais questões
  ],
  "completed": true,
  "score": 85,
  "attempts": 1
}
```

**Resposta de Erro**:
- **Código**: `404 Not Found`
- **Conteúdo**:
```json
{
  "message": "Lesson not found"
}
```

### Submeter Resposta

Valida uma resposta de exercício.

**URL**: `/api/lessons/answer`

**Método**: `POST`

**Autenticação**: Sim

**Corpo da Requisição**:
```json
{
  "lessonId": 1,
  "questionId": "1",
  "answer": "tendência",
  "timeSpent": 15000
}
```

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "correct": true,
  "correctAnswer": "tendência",
  "explanation": "A 'trend' is a tendência - a general direction in which something is developing or changing.",
  "xpEarned": 10
}
```

### Completar Lição

Marca uma lição como completa.

**URL**: `/api/lessons/complete`

**Método**: `POST`

**Autenticação**: Sim

**Corpo da Requisição**:
```json
{
  "lessonId": 1,
  "score": 85,
  "totalQuestions": 4,
  "timeSpent": 120000
}
```

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "progress": {
    "id": 1,
    "userId": 1,
    "lessonId": 1,
    "completed": true,
    "score": 85,
    "timeSpent": 120000,
    "attempts": 1,
    "lastAttempt": "2025-06-07T00:00:00.000Z"
  },
  "xpEarned": 21,
  "completed": true
}
```

## Estatísticas

### Estatísticas Diárias

Obtém estatísticas diárias do usuário.

**URL**: `/api/stats/daily`

**Método**: `GET`

**Autenticação**: Sim

**Parâmetros de Query**:
- `date`: Data no formato YYYY-MM-DD

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "id": 1,
  "userId": 1,
  "date": "2025-06-07",
  "lessonsCompleted": 2,
  "xpEarned": 50,
  "timeSpent": 300000
}
```

### Estatísticas Gerais

Obtém estatísticas gerais do usuário.

**URL**: `/api/stats/overall`

**Método**: `GET`

**Autenticação**: Sim

**Resposta de Sucesso**:
- **Código**: `200 OK`
- **Conteúdo**:
```json
{
  "totalXP": 1250,
  "lessonsCompleted": 25,
  "streak": 7
}
```

## Códigos de Status

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Erro de validação ou dados inválidos
- `401 Unauthorized`: Autenticação necessária
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: nome de usuário já existe)
- `500 Internal Server Error`: Erro interno do servidor

## Formatos de Erro

Todos os erros seguem o formato:

```json
{
  "message": "Descrição do erro",
  "path": "/api/endpoint",
  "timestamp": "2025-06-07T00:00:00.000Z",
  "errors": [
    {
      "path": "campo.com.erro",
      "message": "Descrição do erro de validação"
    }
  ]
}
```

O campo `errors` só está presente em erros de validação, e os campos `path` e `timestamp` só estão presentes em ambiente de desenvolvimento.

