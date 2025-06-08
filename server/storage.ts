/**
 * Camada de acesso a dados
 * 
 * Este módulo fornece uma interface para acessar e manipular dados
 * no banco de dados, com implementações para memória e banco de dados.
 */

import { 
  users, 
  lessons, 
  userProgress, 
  userStats,
  type User, 
  type InsertUser, 
  type Lesson, 
  type InsertLesson,
  type UserProgress,
  type InsertUserProgress,
  type UserStats,
  type InsertUserStats,
  type Question
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { hashPassword, comparePasswords } from "./utils/auth";
import { log, error } from "./utils/logger";

/**
 * Interface para a camada de acesso a dados
 */
export interface IStorage {
  // Métodos de usuário
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Métodos de lição
  getAllLessons(): Promise<Lesson[]>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Métodos de progresso
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  updateProgress(userId: number, lessonId: number, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Métodos de estatísticas
  getUserStats(userId: number, date: string): Promise<UserStats | undefined>;
  updateStats(userId: number, date: string, stats: Partial<UserStats>): Promise<UserStats>;
  getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}>;
}

/**
 * Implementação de armazenamento em memória
 * Útil para desenvolvimento e testes
 */
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private userProgress: Map<string, UserProgress>;
  private userStats: Map<string, UserStats>;
  private currentUserId: number;
  private currentLessonId: number;
  private currentProgressId: number;
  private currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.userProgress = new Map();
    this.userStats = new Map();
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentProgressId = 1;
    this.currentStatsId = 1;
    
    this.seedData();
  }

  /**
   * Popula o armazenamento com dados iniciais
   */
  private seedData() {
    // Cria usuário padrão
    const defaultUser: User = {
      id: 1,
      username: "learner",
      email: "learner@cartoonlingo.com",
      password: "password123",
      streak: 7,
      totalXP: 1250,
      level: 5,
      dailyGoal: 15,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: ["first_lesson", "week_warrior", "vocabulary_master"],
      createdAt: new Date()
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Cria lições baseadas em materiais do NYT
    const sampleLessons: Lesson[] = [
      {
        id: 1,
        title: "Food Trends 2021 - Simple Present",
        description: "Learn about food trends and master Simple Present tense",
        category: "grammar",
        level: 1,
        xpReward: 25,
        order: 1,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'trend' mean?",
            options: ["tendência", "garrafa", "verão", "mundo"],
            correctAnswer: "tendência",
            explanation: "A 'trend' is a tendência - a general direction in which something is developing or changing."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Present: Most forecasters _____ that the pandemic will affect food trends.",
            options: ["agree", "agreed", "agreeing", "will agree"],
            correctAnswer: "agree",
            explanation: "We use Simple Present for facts and general truths. 'Most forecasters agree' is correct."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'forecast' mean?",
            options: ["previsão", "rolha", "inverno", "onda"],
            correctAnswer: "previsão",
            explanation: "A 'forecast' means previsão - a prediction about future events."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct emphatic form: I _____ like coffee (emphatic).",
            options: ["do like", "am like", "like", "will like"],
            correctAnswer: "do like",
            explanation: "We use 'do' + verb for emphasis in positive sentences: 'I do like coffee.'"
          }
        ] as Question[]
      },
      {
        id: 2,
        title: "Tom Hanks Movie - Simple Past",
        description: "Learn about acting and master Simple Past tense",
        category: "grammar",
        level: 2,
        xpReward: 25,
        order: 2,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'challenge' mean?",
            options: ["desafio", "criança", "teatro", "diálogo"],
            correctAnswer: "desafio",
            explanation: "A 'challenge' means desafio - something that requires effort and skill."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Past: The director _____ the film last year.",
            options: ["made", "make", "makes", "making"],
            correctAnswer: "made",
            explanation: "Simple Past of 'make' is 'made'. We use it for completed actions in the past."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What is the past form of 'see'?",
            options: ["saw", "seen", "sawed", "seeing"],
            correctAnswer: "saw",
            explanation: "'See' is irregular: see-saw-seen. The simple past is 'saw'."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct negative: She _____ go to the theater yesterday.",
            options: ["did not", "does not", "will not", "is not"],
            correctAnswer: "did not",
            explanation: "For Simple Past negative, we use 'did not' + base verb: 'She did not go'."
          }
        ] as Question[]
      },
      {
        id: 3,
        title: "Travel Planning - Simple Future",
        description: "Learn about travel and master Simple Future tense",
        category: "grammar",
        level: 3,
        xpReward: 25,
        order: 3,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'suitcase' mean?",
            options: ["mala", "estrada", "corredor", "enquete"],
            correctAnswer: "mala",
            explanation: "A 'suitcase' means mala - a bag used for carrying clothes when traveling."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Future: I _____ unpack my suitcase tomorrow.",
            options: ["will", "am", "do", "have"],
            correctAnswer: "will",
            explanation: "Simple Future uses 'will' + base verb: 'I will unpack'."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'psychiatrist' mean?",
            options: ["psiquiatra", "viajante", "marido", "escolha"],
            correctAnswer: "psiquiatra",
            explanation: "A 'psychiatrist' means psiquiatra - a medical doctor who treats mental health."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct negative future: They _____ leave early.",
            options: ["will not", "do not", "are not", "did not"],
            correctAnswer: "will not",
            explanation: "Future negative uses 'will not' (won't): 'They will not leave early'."
          }
        ] as Question[]
      },
      {
        id: 4,
        title: "Kitchen Organization - Articles",
        description: "Learn about cooking and master Articles (a/an/the)",
        category: "grammar",
        level: 2,
        xpReward: 20,
        order: 4,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'tidy' mean?",
            options: ["arrumado", "regra", "padaria", "gaveta"],
            correctAnswer: "arrumado",
            explanation: "'Tidy' means arrumado - neat and organized."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Choose the correct article: I work in ___ professional kitchen.",
            options: ["a", "an", "the", "no article"],
            correctAnswer: "a",
            explanation: "We use 'a' before consonant sounds. 'Professional' starts with /p/ sound."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'perishable' mean?",
            options: ["perecível", "molho", "lixo", "bandeja"],
            correctAnswer: "perecível",
            explanation: "'Perishable' means perecível - food that goes bad quickly."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct article: ___ capital of France is Paris.",
            options: ["The", "A", "An", "No article"],
            correctAnswer: "The",
            explanation: "We use 'the' when talking about something specific and unique: 'The capital'."
          }
        ] as Question[]
      },
      {
        id: 5,
        title: "DNA Technology - Demonstratives",
        description: "Learn about science and master This/That/These/Those",
        category: "grammar",
        level: 3,
        xpReward: 30,
        order: 5,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'sample' mean?",
            options: ["amostra", "traço", "culpado", "assassino"],
            correctAnswer: "amostra",
            explanation: "A 'sample' means amostra - a small part taken for analysis."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Choose the correct demonstrative: ___ technology is very advanced (close to speaker).",
            options: ["This", "That", "These", "Those"],
            correctAnswer: "This",
            explanation: "We use 'this' (singular) for things close to the speaker."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'accurate' mean?",
            options: ["preciso", "suficiente", "cabelo", "imagem"],
            correctAnswer: "preciso",
            explanation: "'Accurate' means preciso - correct and exact."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct demonstrative: Can you see ___ birds over there? (far, plural)",
            options: ["those", "these", "that", "this"],
            correctAnswer: "those",
            explanation: "We use 'those' (plural) for things far from the speaker."
          }
        ] as Question[]
      }
    ];

    sampleLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
    this.currentLessonId = 6;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && await comparePasswords(password, user.password)) {
      return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      password: hashedPassword,
      id,
      streak: 0,
      totalXP: 0,
      level: 1,
      dailyGoal: 15,
      lastActiveDate: null,
      achievements: [],
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    
    // Log de atualizações para depuração
    log(`User ${id} updated: ${JSON.stringify(updates)}`);
    
    return updatedUser;
  }

  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.category === category)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { 
      ...insertLesson, 
      id,
      level: insertLesson.level ?? 1,
      xpReward: insertLesson.xpReward ?? 10,
      isLocked: insertLesson.isLocked ?? false
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const key = `${userId}-${lessonId}`;
    return this.userProgress.get(key);
  }

  async updateProgress(userId: number, lessonId: number, progressUpdates: Partial<UserProgress>): Promise<UserProgress> {
    const key = `${userId}-${lessonId}`;
    const existing = this.userProgress.get(key);
    
    const progress: UserProgress = existing ? 
      { ...existing, ...progressUpdates } :
      {
        id: this.currentProgressId++,
        userId,
        lessonId,
        completed: false,
        score: 0,
        timeSpent: 0,
        attempts: 0,
        lastAttempt: new Date(),
        ...progressUpdates
      };

    this.userProgress.set(key, progress);
    return progress;
  }

  async getUserStats(userId: number, date: string): Promise<UserStats | undefined> {
    const key = `${userId}-${date}`;
    return this.userStats.get(key);
  }

  async updateStats(userId: number, date: string, statsUpdates: Partial<UserStats>): Promise<UserStats> {
    const key = `${userId}-${date}`;
    const existing = this.userStats.get(key);
    
    const stats: UserStats = existing ?
      { ...existing, ...statsUpdates } :
      {
        id: this.currentStatsId++,
        userId,
        date,
        lessonsCompleted: 0,
        xpEarned: 0,
        timeSpent: 0,
        ...statsUpdates
      };

    this.userStats.set(key, stats);
    return stats;
  }

  async getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}> {
    const user = await this.getUser(userId);
    const userProgressList = await this.getUserProgress(userId);
    
    const lessonsCompleted = userProgressList.filter(p => p.completed).length;
    
    return {
      totalXP: user?.totalXP || 0,
      lessonsCompleted,
      streak: user?.streak || 0
    };
  }
}

/**
 * Implementação de armazenamento em banco de dados
 * Utiliza Drizzle ORM para acesso ao banco de dados
 */
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (err) {
      error(`Error fetching user ${id}`, err);
      throw err;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (err) {
      error(`Error fetching user by username ${username}`, err);
      throw err;
    }
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    try {
      const user = await this.getUserByUsername(username);
      if (user && await comparePasswords(password, user.password)) {
        return user;
      }
      return undefined;
    } catch (err) {
      error(`Error authenticating user ${username}`, err);
      throw err;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const hashedPassword = await hashPassword(user.password);
      const result = await db.insert(users).values({
        ...user,
        password: hashedPassword,
        streak: 0,
        totalXP: 0,
        level: 1,
        dailyGoal: 15,
        lastActiveDate: null,
        achievements: [],
        createdAt: new Date()
      }).returning();
      
      return result[0];
    } catch (err) {
      error(`Error creating user ${user.username}`, err);
      throw err;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db.update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      
      return result[0];
    } catch (err) {
      error(`Error updating user ${id}`, err);
      throw err;
    }
  }

  async getAllLessons(): Promise<Lesson[]> {
    try {
      return await db.select().from(lessons).orderBy(lessons.order);
    } catch (err) {
      error("Error fetching all lessons", err);
      throw err;
    }
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    try {
      return await db.select()
        .from(lessons)
        .where(eq(lessons.category, category))
        .orderBy(lessons.order);
    } catch (err) {
      error(`Error fetching lessons by category ${category}`, err);
      throw err;
    }
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    try {
      const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
      return result[0];
    } catch (err) {
      error(`Error fetching lesson ${id}`, err);
      throw err;
    }
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    try {
      const result = await db.insert(lessons).values({
        ...lesson,
        level: lesson.level ?? 1,
        xpReward: lesson.xpReward ?? 10,
        isLocked: lesson.isLocked ?? false
      }).returning();
      
      return result[0];
    } catch (err) {
      error(`Error creating lesson ${lesson.title}`, err);
      throw err;
    }
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    try {
      return await db.select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));
    } catch (err) {
      error(`Error fetching progress for user ${userId}`, err);
      throw err;
    }
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    try {
      const result = await db.select()
        .from(userProgress)
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.lessonId, lessonId)
        ))
        .limit(1);
      
      return result[0];
    } catch (err) {
      error(`Error fetching progress for user ${userId} and lesson ${lessonId}`, err);
      throw err;
    }
  }

  async updateProgress(userId: number, lessonId: number, progress: Partial<UserProgress>): Promise<UserProgress> {
    try {
      // Verifica se o progresso já existe
      const existing = await this.getLessonProgress(userId, lessonId);
      
      if (existing) {
        // Atualiza o progresso existente
        const result = await db.update(userProgress)
          .set(progress)
          .where(and(
            eq(userProgress.userId, userId),
            eq(userProgress.lessonId, lessonId)
          ))
          .returning();
        
        return result[0];
      } else {
        // Cria um novo progresso
        const result = await db.insert(userProgress).values({
          userId,
          lessonId,
          completed: false,
          score: 0,
          timeSpent: 0,
          attempts: 0,
          lastAttempt: new Date(),
          ...progress
        }).returning();
        
        return result[0];
      }
    } catch (err) {
      error(`Error updating progress for user ${userId} and lesson ${lessonId}`, err);
      throw err;
    }
  }

  async getUserStats(userId: number, date: string): Promise<UserStats | undefined> {
    try {
      const result = await db.select()
        .from(userStats)
        .where(and(
          eq(userStats.userId, userId),
          eq(userStats.date, date)
        ))
        .limit(1);
      
      return result[0];
    } catch (err) {
      error(`Error fetching stats for user ${userId} on ${date}`, err);
      throw err;
    }
  }

  async updateStats(userId: number, date: string, stats: Partial<UserStats>): Promise<UserStats> {
    try {
      // Verifica se as estatísticas já existem
      const existing = await this.getUserStats(userId, date);
      
      if (existing) {
        // Atualiza as estatísticas existentes
        const result = await db.update(userStats)
          .set(stats)
          .where(and(
            eq(userStats.userId, userId),
            eq(userStats.date, date)
          ))
          .returning();
        
        return result[0];
      } else {
        // Cria novas estatísticas
        const result = await db.insert(userStats).values({
          userId,
          date,
          lessonsCompleted: 0,
          xpEarned: 0,
          timeSpent: 0,
          ...stats
        }).returning();
        
        return result[0];
      }
    } catch (err) {
      error(`Error updating stats for user ${userId} on ${date}`, err);
      throw err;
    }
  }

  async getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}> {
    try {
      // Obtém o usuário
      const user = await this.getUser(userId);
      
      if (!user) {
        return {
          totalXP: 0,
          lessonsCompleted: 0,
          streak: 0
        };
      }
      
      // Conta lições completadas
      const completedLessons = await db.select({ count: userProgress.id })
        .from(userProgress)
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.completed, true)
        ));
      
      const lessonsCompleted = completedLessons[0]?.count || 0;
      
      return {
        totalXP: user.totalXP || 0,
        lessonsCompleted: Number(lessonsCompleted),
        streak: user.streak || 0
      };
    } catch (err) {
      error(`Error fetching overall stats for user ${userId}`, err);
      throw err;
    }
  }
}

// Exporta a implementação de armazenamento apropriada
// Em produção, usaria DatabaseStorage
// Em desenvolvimento ou testes, pode usar MemStorage
export const storage = process.env.NODE_ENV === 'test' 
  ? new MemStorage() 
  : new MemStorage(); // Temporariamente usando MemStorage até configurar o banco de dados

