import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  streak: integer("streak").default(0),
  totalXP: integer("total_xp").default(0),
  level: integer("level").default(1),
  dailyGoal: integer("daily_goal").default(15),
  lastActiveDate: text("last_active_date"),
  achievements: text("achievements").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // vocabulary, grammar, phrases, pronunciation
  level: integer("level").default(1),
  xpReward: integer("xp_reward").default(10),
  questions: jsonb("questions").notNull(),
  order: integer("order").notNull(),
  isLocked: boolean("is_locked").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  timeSpent: integer("time_spent").default(0),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  lessonsCompleted: integer("lessons_completed").default(0),
  xpEarned: integer("xp_earned").default(0),
  timeSpent: integer("time_spent").default(0),
});

// Question types for lessons
export const questionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  type: z.enum(['multiple_choice', 'translation', 'audio', 'matching']),
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  audioUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  explanation: z.string().min(1).optional(),
}).refine(data => {
  // For multiple choice, options are required
  if (data.type === 'multiple_choice') {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: "Multiple choice questions must have at least 2 options",
  path: ["options"]
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dailyGoal: z.number().min(1, "Daily goal must be at least 1").max(100, "Daily goal cannot exceed 100"),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
}).extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be at most 500 characters"),
  category: z.enum(['vocabulary', 'grammar', 'phrases', 'pronunciation'], {
    errorMap: () => ({ message: "Category must be vocabulary, grammar, phrases, or pronunciation" })
  }),
  level: z.number().min(1, "Level must be at least 1").max(10, "Level cannot exceed 10"),
  xpReward: z.number().min(0, "XP reward cannot be negative").max(1000, "XP reward cannot exceed 1000"),
  questions: z.array(questionSchema).min(1, "At least one question is required").max(20, "Cannot have more than 20 questions"),
  order: z.number().min(1, "Order must be at least 1"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAttempt: true,
}).extend({
  userId: z.number().min(1, "User ID is required"),
  lessonId: z.number().min(1, "Lesson ID is required"),
  score: z.number().min(0, "Score cannot be negative").max(100, "Score cannot exceed 100"),
  timeSpent: z.number().min(0, "Time spent cannot be negative"),
  attempts: z.number().min(0, "Attempts cannot be negative").max(10, "Cannot have more than 10 attempts"),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
}).extend({
  userId: z.number().min(1, "User ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  lessonsCompleted: z.number().min(0, "Lessons completed cannot be negative").max(50, "Cannot complete more than 50 lessons per day"),
  xpEarned: z.number().min(0, "XP earned cannot be negative").max(5000, "Cannot earn more than 5000 XP per day"),
  timeSpent: z.number().min(0, "Time spent cannot be negative").max(86400, "Cannot spend more than 24 hours per day"),
});

// Login validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
  dailyGoal: z.number().min(1).max(100).optional(),
  streak: z.number().min(0).optional(),
  totalXP: z.number().min(0).optional(),
  level: z.number().min(1).max(100).optional(),
  lastActiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  achievements: z.array(z.string()).optional(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  stats: many(userStats),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type Question = z.infer<typeof questionSchema>;
