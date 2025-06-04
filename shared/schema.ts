import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: text("module_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  timeSpent: integer("time_spent").default(0), // in seconds
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const vocabularyProgress = pgTable("vocabulary_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wordId: text("word_id").notNull(),
  status: text("status").notNull(), // 'learning', 'known', 'mastered'
  practiceCount: integer("practice_count").default(0),
  lastPracticed: timestamp("last_practiced").defaultNow(),
});

export const exerciseResults = pgTable("exercise_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const conversationRecordings = pgTable("conversation_recordings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: text("question_id").notNull(),
  audioUrl: text("audio_url"),
  transcript: text("transcript"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAccessed: true,
});

export const insertVocabularyProgressSchema = createInsertSchema(vocabularyProgress).omit({
  id: true,
  lastPracticed: true,
});

export const insertExerciseResultSchema = createInsertSchema(exerciseResults).omit({
  id: true,
  completedAt: true,
});

export const insertConversationRecordingSchema = createInsertSchema(conversationRecordings).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type VocabularyProgress = typeof vocabularyProgress.$inferSelect;
export type ExerciseResult = typeof exerciseResults.$inferSelect;
export type ConversationRecording = typeof conversationRecordings.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertVocabularyProgress = z.infer<typeof insertVocabularyProgressSchema>;
export type InsertExerciseResult = z.infer<typeof insertExerciseResultSchema>;
export type InsertConversationRecording = z.infer<typeof insertConversationRecordingSchema>;
