import { 
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
import { calculateRealisticUserData, getLastActiveDate } from "./user-utils";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Lesson methods
  getAllLessons(): Promise<Lesson[]>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  updateProgress(userId: number, lessonId: number, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Stats methods
  getUserStats(userId: number, date: string): Promise<UserStats | undefined>;
  updateStats(userId: number, date: string, stats: Partial<UserStats>): Promise<UserStats>;
  getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}>;
}

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

  private seedData() {
    // Create default user
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
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create lessons based on cartoon materials
    const lessons: Lesson[] = [
      {
        id: 1,
        title: "Basic Cartoon Vocabulary",
        description: "Learn fundamental cartoon and animation terms",
        category: "vocabulary",
        level: 1,
        xpReward: 100,
        order: 1,
        isLocked: false,
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is a 'frame' in animation?",
            options: ["A single image", "A border", "A window", "A picture frame"],
            correctAnswer: 0,
            explanation: "In animation, a frame is a single image in a sequence that creates motion when played rapidly."
          },
          {
            id: 2,
            type: "fill_blank",
            question: "Animation is created by showing many _____ quickly.",
            correctAnswer: "frames",
            explanation: "Animation works by displaying multiple frames in rapid succession to create the illusion of movement."
          }
        ],
      },
      {
        id: 2,
        title: "Character Design Basics",
        description: "Understanding cartoon character creation",
        category: "design",
        level: 1,
        xpReward: 150,
        order: 2,
        isLocked: false,
        questions: [
          {
            id: 3,
            type: "multiple_choice",
            question: "What makes a cartoon character memorable?",
            options: ["Complex details", "Simple, distinctive features", "Realistic proportions", "Many colors"],
            correctAnswer: 1,
            explanation: "Simple, distinctive features make cartoon characters easy to recognize and remember."
          }
        ],
      }
    ];

    lessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
    this.currentLessonId = lessons.length + 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.username === username);
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.username === username && user.password === password);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
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
      createdAt: new Date()
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const progressList: UserProgress[] = [];
    for (const progress of this.userProgress.values()) {
      if (progress.userId === userId) {
        progressList.push(progress);
      }
    }
    return progressList;
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
        xpEarned: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        createdAt: new Date(),
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
        createdAt: new Date(),
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

export const storage = new MemStorage();