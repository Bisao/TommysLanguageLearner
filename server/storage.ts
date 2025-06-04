import { 
  users, 
  userProgress, 
  vocabularyProgress, 
  exerciseResults, 
  conversationRecordings,
  type User, 
  type InsertUser, 
  type UserProgress,
  type VocabularyProgress,
  type ExerciseResult,
  type ConversationRecording,
  type InsertUserProgress,
  type InsertVocabularyProgress,
  type InsertExerciseResult,
  type InsertConversationRecording
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProgress(userId: number, moduleId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getVocabularyProgress(userId: number): Promise<VocabularyProgress[]>;
  updateVocabularyProgress(progress: InsertVocabularyProgress): Promise<VocabularyProgress>;
  saveExerciseResult(result: InsertExerciseResult): Promise<ExerciseResult>;
  getExerciseResults(userId: number, exerciseId?: string): Promise<ExerciseResult[]>;
  saveConversationRecording(recording: InsertConversationRecording): Promise<ConversationRecording>;
  getConversationRecordings(userId: number): Promise<ConversationRecording[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProgress: Map<string, UserProgress>;
  private vocabularyProgress: Map<string, VocabularyProgress>;
  private exerciseResults: Map<number, ExerciseResult>;
  private conversationRecordings: Map<number, ConversationRecording>;
  private currentUserId: number;
  private currentProgressId: number;
  private currentVocabId: number;
  private currentExerciseId: number;
  private currentRecordingId: number;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.vocabularyProgress = new Map();
    this.exerciseResults = new Map();
    this.conversationRecordings = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
    this.currentVocabId = 1;
    this.currentExerciseId = 1;
    this.currentRecordingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserProgress(userId: number, moduleId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId && progress.moduleId === moduleId
    );
  }

  async updateUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const key = `${progressData.userId}-${progressData.moduleId}-${progressData.lessonId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...progressData, lastAccessed: new Date() };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const newProgress: UserProgress = {
        id,
        ...progressData,
        lastAccessed: new Date(),
      };
      this.userProgress.set(key, newProgress);
      return newProgress;
    }
  }

  async getVocabularyProgress(userId: number): Promise<VocabularyProgress[]> {
    return Array.from(this.vocabularyProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async updateVocabularyProgress(progressData: InsertVocabularyProgress): Promise<VocabularyProgress> {
    const key = `${progressData.userId}-${progressData.wordId}`;
    const existing = this.vocabularyProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...progressData, lastPracticed: new Date() };
      this.vocabularyProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentVocabId++;
      const newProgress: VocabularyProgress = {
        id,
        ...progressData,
        lastPracticed: new Date(),
      };
      this.vocabularyProgress.set(key, newProgress);
      return newProgress;
    }
  }

  async saveExerciseResult(resultData: InsertExerciseResult): Promise<ExerciseResult> {
    const id = this.currentExerciseId++;
    const result: ExerciseResult = {
      id,
      ...resultData,
      completedAt: new Date(),
    };
    this.exerciseResults.set(id, result);
    return result;
  }

  async getExerciseResults(userId: number, exerciseId?: string): Promise<ExerciseResult[]> {
    return Array.from(this.exerciseResults.values()).filter(
      (result) => result.userId === userId && (!exerciseId || result.exerciseId === exerciseId)
    );
  }

  async saveConversationRecording(recordingData: InsertConversationRecording): Promise<ConversationRecording> {
    const id = this.currentRecordingId++;
    const recording: ConversationRecording = {
      id,
      ...recordingData,
      createdAt: new Date(),
    };
    this.conversationRecordings.set(id, recording);
    return recording;
  }

  async getConversationRecordings(userId: number): Promise<ConversationRecording[]> {
    return Array.from(this.conversationRecordings.values()).filter(
      (recording) => recording.userId === userId
    );
  }
}

export const storage = new MemStorage();
