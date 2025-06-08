var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertLessonSchema: () => insertLessonSchema,
  insertUserProgressSchema: () => insertUserProgressSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserStatsSchema: () => insertUserStatsSchema,
  lessons: () => lessons,
  lessonsRelations: () => lessonsRelations,
  loginSchema: () => loginSchema,
  questionSchema: () => questionSchema,
  updateUserSchema: () => updateUserSchema,
  userProgress: () => userProgress,
  userProgressRelations: () => userProgressRelations,
  userStats: () => userStats,
  userStatsRelations: () => userStatsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";
var users, lessons, userProgress, userStats, questionSchema, insertUserSchema, insertLessonSchema, insertUserProgressSchema, insertUserStatsSchema, loginSchema, updateUserSchema, usersRelations, lessonsRelations, userProgressRelations, userStatsRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
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
      createdAt: timestamp("created_at").defaultNow()
    });
    lessons = pgTable("lessons", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // vocabulary, grammar, phrases, pronunciation
      level: integer("level").default(1),
      xpReward: integer("xp_reward").default(10),
      questions: jsonb("questions").notNull(),
      order: integer("order").notNull(),
      isLocked: boolean("is_locked").default(true)
    });
    userProgress = pgTable("user_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      lessonId: integer("lesson_id").notNull(),
      completed: boolean("completed").default(false),
      score: integer("score").default(0),
      timeSpent: integer("time_spent").default(0),
      attempts: integer("attempts").default(0),
      lastAttempt: timestamp("last_attempt").defaultNow()
    });
    userStats = pgTable("user_stats", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      date: text("date").notNull(),
      lessonsCompleted: integer("lessons_completed").default(0),
      xpEarned: integer("xp_earned").default(0),
      timeSpent: integer("time_spent").default(0)
    });
    questionSchema = z.object({
      id: z.string().min(1, "Question ID is required"),
      type: z.enum(["multiple_choice", "translation", "audio", "matching"]),
      question: z.string().min(1, "Question text is required"),
      options: z.array(z.string().min(1)).min(2).max(6).optional(),
      correctAnswer: z.string().min(1, "Correct answer is required"),
      audioUrl: z.string().url().optional().or(z.literal("")),
      imageUrl: z.string().url().optional().or(z.literal("")),
      explanation: z.string().min(1).optional()
    }).refine((data) => {
      if (data.type === "multiple_choice") {
        return data.options && data.options.length >= 2;
      }
      return true;
    }, {
      message: "Multiple choice questions must have at least 2 options",
      path: ["options"]
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true
    }).extend({
      username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      dailyGoal: z.number().min(1, "Daily goal must be at least 1").max(100, "Daily goal cannot exceed 100")
    });
    insertLessonSchema = createInsertSchema(lessons).omit({
      id: true
    }).extend({
      title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
      description: z.string().min(1, "Description is required").max(500, "Description must be at most 500 characters"),
      category: z.enum(["vocabulary", "grammar", "phrases", "pronunciation"], {
        errorMap: () => ({ message: "Category must be vocabulary, grammar, phrases, or pronunciation" })
      }),
      level: z.number().min(1, "Level must be at least 1").max(10, "Level cannot exceed 10"),
      xpReward: z.number().min(0, "XP reward cannot be negative").max(1e3, "XP reward cannot exceed 1000"),
      questions: z.array(questionSchema).min(1, "At least one question is required").max(20, "Cannot have more than 20 questions"),
      order: z.number().min(1, "Order must be at least 1")
    });
    insertUserProgressSchema = createInsertSchema(userProgress).omit({
      id: true,
      lastAttempt: true
    }).extend({
      userId: z.number().min(1, "User ID is required"),
      lessonId: z.number().min(1, "Lesson ID is required"),
      score: z.number().min(0, "Score cannot be negative").max(100, "Score cannot exceed 100"),
      timeSpent: z.number().min(0, "Time spent cannot be negative"),
      attempts: z.number().min(0, "Attempts cannot be negative").max(10, "Cannot have more than 10 attempts")
    });
    insertUserStatsSchema = createInsertSchema(userStats).omit({
      id: true
    }).extend({
      userId: z.number().min(1, "User ID is required"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      lessonsCompleted: z.number().min(0, "Lessons completed cannot be negative").max(50, "Cannot complete more than 50 lessons per day"),
      xpEarned: z.number().min(0, "XP earned cannot be negative").max(5e3, "Cannot earn more than 5000 XP per day"),
      timeSpent: z.number().min(0, "Time spent cannot be negative").max(86400, "Cannot spend more than 24 hours per day")
    });
    loginSchema = z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required")
    });
    updateUserSchema = z.object({
      username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
      email: z.string().email().optional(),
      dailyGoal: z.number().min(1).max(100).optional(),
      streak: z.number().min(0).optional(),
      totalXP: z.number().min(0).optional(),
      level: z.number().min(1).max(100).optional(),
      lastActiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      achievements: z.array(z.string()).optional()
    });
    usersRelations = relations(users, ({ many }) => ({
      progress: many(userProgress),
      stats: many(userStats)
    }));
    lessonsRelations = relations(lessons, ({ many }) => ({
      progress: many(userProgress)
    }));
    userProgressRelations = relations(userProgress, ({ one }) => ({
      user: one(users, {
        fields: [userProgress.userId],
        references: [users.id]
      }),
      lesson: one(lessons, {
        fields: [userProgress.lessonId],
        references: [lessons.id]
      })
    }));
    userStatsRelations = relations(userStats, ({ one }) => ({
      user: one(users, {
        fields: [userStats.userId],
        references: [users.id]
      })
    }));
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/migrate-users.ts
var migrate_users_exports = {};
__export(migrate_users_exports, {
  migrateExistingUsers: () => migrateExistingUsers
});
import { eq as eq2 } from "drizzle-orm";
async function migrateExistingUsers() {
  try {
    const allUsers = await db.select().from(users);
    for (const user of allUsers) {
      const createdAt = user.createdAt || /* @__PURE__ */ new Date();
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const userCreatedToday = createdAt.toISOString().split("T")[0] === today;
      if (userCreatedToday) {
        await db.update(users).set({
          totalXP: 0,
          level: 1,
          streak: 0,
          achievements: [],
          createdAt: /* @__PURE__ */ new Date(),
          lastActiveDate: today
        }).where(eq2(users.id, user.id));
      }
    }
    console.log("Migra\xE7\xE3o de usu\xE1rios conclu\xEDda com sucesso!");
  } catch (error2) {
    console.error("Erro na migra\xE7\xE3o de usu\xE1rios:", error2);
  }
}
var init_migrate_users = __esm({
  "server/migrate-users.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/seed-data.ts
var seed_data_exports = {};
__export(seed_data_exports, {
  resetDatabase: () => resetDatabase,
  seedDatabase: () => seedDatabase
});
import bcrypt2 from "bcrypt";
async function seedDatabase() {
  try {
    console.log("\u{1F331} Starting database seeding...");
    const existingLessons = await db.select().from(lessons).limit(1);
    if (existingLessons.length > 0) {
      console.log("\u{1F4DA} Database already seeded, skipping...");
      return;
    }
    console.log("\u{1F4DA} Seeding lessons...");
    for (const lesson of seedLessons) {
      await db.insert(lessons).values({
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        level: lesson.level,
        xpReward: lesson.xpReward,
        questions: lesson.questions,
        order: lesson.order,
        isLocked: lesson.isLocked
      });
    }
    console.log("\u{1F465} Seeding demo users...");
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt2.hash(userData.password, 12);
      const [user] = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        streak: userData.streak,
        totalXP: userData.totalXP,
        level: userData.level,
        dailyGoal: userData.dailyGoal,
        lastActiveDate: userData.lastActiveDate,
        achievements: userData.achievements,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      if (userData.username === "demo") {
        await db.insert(userProgress).values({
          userId: user.id,
          lessonId: 1,
          completed: true,
          score: 85,
          timeSpent: 120,
          attempts: 1
        });
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        await db.insert(userStats).values({
          userId: user.id,
          date: today,
          lessonsCompleted: 1,
          xpEarned: 10,
          timeSpent: 120
        });
      }
      if (userData.username === "student") {
        for (let i = 1; i <= 3; i++) {
          await db.insert(userProgress).values({
            userId: user.id,
            lessonId: i,
            completed: true,
            score: 90 + i * 2,
            timeSpent: 100 + i * 20,
            attempts: 1
          });
        }
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split("T")[0]);
        }
        for (const date of dates) {
          await db.insert(userStats).values({
            userId: user.id,
            date,
            lessonsCompleted: Math.floor(Math.random() * 3) + 1,
            xpEarned: Math.floor(Math.random() * 50) + 20,
            timeSpent: Math.floor(Math.random() * 300) + 100
          });
        }
      }
    }
    console.log("\u2705 Database seeding completed successfully!");
    console.log("\u{1F4CA} Demo accounts created:");
    console.log("   - Username: demo, Password: demo123");
    console.log("   - Username: student, Password: student123");
  } catch (error2) {
    console.error("\u274C Error seeding database:", error2);
    throw error2;
  }
}
async function resetDatabase() {
  try {
    console.log("\u{1F504} Resetting database...");
    await db.delete(userStats);
    await db.delete(userProgress);
    await db.delete(lessons);
    await db.delete(users);
    console.log("\u{1F5D1}\uFE0F Database cleared, re-seeding...");
    await seedDatabase();
  } catch (error2) {
    console.error("\u274C Error resetting database:", error2);
    throw error2;
  }
}
var seedLessons, seedUsers;
var init_seed_data = __esm({
  "server/seed-data.ts"() {
    "use strict";
    init_db();
    init_schema();
    seedLessons = [
      // Vocabulary Lessons
      {
        title: "Basic Greetings",
        description: "Learn essential greeting words and phrases",
        category: "vocabulary",
        level: 1,
        xpReward: 10,
        order: 1,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'Hello' mean?",
            options: ["Goodbye", "Good morning", "A greeting", "Thank you"],
            correctAnswer: "A greeting",
            explanation: "Hello is a common greeting used when meeting someone."
          },
          {
            id: "2",
            type: "translation",
            question: "Translate: 'Good morning'",
            correctAnswer: "Bom dia",
            explanation: "Good morning is used to greet someone in the morning."
          }
        ]
      },
      {
        title: "Family Members",
        description: "Learn words for family relationships",
        category: "vocabulary",
        level: 1,
        xpReward: 15,
        order: 2,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What is a 'sibling'?",
            options: ["Parent", "Brother or sister", "Cousin", "Friend"],
            correctAnswer: "Brother or sister",
            explanation: "A sibling is your brother or sister."
          }
        ]
      },
      {
        title: "Colors and Shapes",
        description: "Basic colors and geometric shapes",
        category: "vocabulary",
        level: 1,
        xpReward: 12,
        order: 3,
        isLocked: true,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What color is the sun usually depicted as?",
            options: ["Blue", "Green", "Yellow", "Purple"],
            correctAnswer: "Yellow",
            explanation: "The sun is commonly shown as yellow in drawings."
          }
        ]
      },
      // Grammar Lessons
      {
        title: "Present Simple",
        description: "Learn the present simple tense",
        category: "grammar",
        level: 1,
        xpReward: 20,
        order: 4,
        isLocked: true,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "Complete: 'She ___ to school every day'",
            options: ["go", "goes", "going", "went"],
            correctAnswer: "goes",
            explanation: "With third person singular (she/he/it), we add 's' to the verb."
          }
        ]
      },
      {
        title: "Articles (a, an, the)",
        description: "Understanding when to use articles",
        category: "grammar",
        level: 1,
        xpReward: 18,
        order: 5,
        isLocked: true,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "Choose the correct article: '___ apple'",
            options: ["a", "an", "the", "no article"],
            correctAnswer: "an",
            explanation: "We use 'an' before words that start with a vowel sound."
          }
        ]
      },
      // Phrases Lessons
      {
        title: "Common Expressions",
        description: "Everyday phrases and expressions",
        category: "phrases",
        level: 1,
        xpReward: 15,
        order: 6,
        isLocked: true,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'Break a leg' mean?",
            options: ["Get injured", "Good luck", "Run fast", "Be careful"],
            correctAnswer: "Good luck",
            explanation: "'Break a leg' is an idiom meaning 'good luck', often used before performances."
          }
        ]
      },
      // Pronunciation Lessons
      {
        title: "Vowel Sounds",
        description: "Practice English vowel pronunciation",
        category: "pronunciation",
        level: 1,
        xpReward: 25,
        order: 7,
        isLocked: true,
        questions: [
          {
            id: "1",
            type: "audio",
            question: "Listen and repeat the sound: /\xE6/",
            correctAnswer: "/\xE6/",
            audioUrl: "/audio/vowel-a.mp3",
            explanation: "This is the 'a' sound as in 'cat', 'hat', 'map'."
          }
        ]
      }
    ];
    seedUsers = [
      {
        username: "demo",
        email: "demo@tommysacademy.com",
        password: "demo123",
        streak: 5,
        totalXP: 150,
        level: 2,
        dailyGoal: 20,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        achievements: ["first_lesson", "vocabulary_master"]
      },
      {
        username: "student",
        email: "student@tommysacademy.com",
        password: "student123",
        streak: 12,
        totalXP: 450,
        level: 4,
        dailyGoal: 15,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        achievements: ["first_lesson", "week_warrior", "grammar_guru"]
      }
    ];
  }
});

// server/index.ts
import express2 from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_db();
import { eq, and } from "drizzle-orm";

// server/utils/auth.ts
import bcrypt from "bcrypt";
var SALT_ROUNDS = 12;
var hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};
var comparePasswords = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// server/utils/logger.ts
var log = (message) => {
  console.log(`[INFO] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`);
};
var error = (message, err) => {
  console.error(`[ERROR] ${(/* @__PURE__ */ new Date()).toISOString()}: ${message}`, err || "");
};

// server/storage.ts
var MemStorage = class {
  users;
  lessons;
  userProgress;
  userStats;
  currentUserId;
  currentLessonId;
  currentProgressId;
  currentStatsId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.lessons = /* @__PURE__ */ new Map();
    this.userProgress = /* @__PURE__ */ new Map();
    this.userStats = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentProgressId = 1;
    this.currentStatsId = 1;
    this.seedData();
  }
  /**
   * Popula o armazenamento com dados iniciais
   */
  seedData() {
    const defaultUser = {
      id: 1,
      username: "learner",
      email: "learner@cartoonlingo.com",
      password: "password123",
      streak: 7,
      totalXP: 1250,
      level: 5,
      dailyGoal: 15,
      lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      achievements: ["first_lesson", "week_warrior", "vocabulary_master"],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;
    const sampleLessons = [
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
            options: ["tend\xEAncia", "garrafa", "ver\xE3o", "mundo"],
            correctAnswer: "tend\xEAncia",
            explanation: "A 'trend' is a tend\xEAncia - a general direction in which something is developing or changing."
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
            options: ["previs\xE3o", "rolha", "inverno", "onda"],
            correctAnswer: "previs\xE3o",
            explanation: "A 'forecast' means previs\xE3o - a prediction about future events."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct emphatic form: I _____ like coffee (emphatic).",
            options: ["do like", "am like", "like", "will like"],
            correctAnswer: "do like",
            explanation: "We use 'do' + verb for emphasis in positive sentences: 'I do like coffee.'"
          }
        ]
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
            options: ["desafio", "crian\xE7a", "teatro", "di\xE1logo"],
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
        ]
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
        ]
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
            options: ["perec\xEDvel", "molho", "lixo", "bandeja"],
            correctAnswer: "perec\xEDvel",
            explanation: "'Perishable' means perec\xEDvel - food that goes bad quickly."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct article: ___ capital of France is Paris.",
            options: ["The", "A", "An", "No article"],
            correctAnswer: "The",
            explanation: "We use 'the' when talking about something specific and unique: 'The capital'."
          }
        ]
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
            options: ["amostra", "tra\xE7o", "culpado", "assassino"],
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
        ]
      }
    ];
    sampleLessons.forEach((lesson) => {
      this.lessons.set(lesson.id, lesson);
    });
    this.currentLessonId = 6;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async authenticateUser(username, password) {
    const user = await this.getUserByUsername(username);
    if (user && await comparePasswords(password, user.password)) {
      return user;
    }
    return void 0;
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const hashedPassword = await hashPassword(insertUser.password);
    const user = {
      ...insertUser,
      password: hashedPassword,
      id,
      streak: 0,
      totalXP: 0,
      level: 1,
      dailyGoal: 15,
      lastActiveDate: null,
      achievements: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    log(`User ${id} updated: ${JSON.stringify(updates)}`);
    return updatedUser;
  }
  async getAllLessons() {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }
  async getLessonsByCategory(category) {
    return Array.from(this.lessons.values()).filter((lesson) => lesson.category === category).sort((a, b) => a.order - b.order);
  }
  async getLesson(id) {
    return this.lessons.get(id);
  }
  async createLesson(insertLesson) {
    const id = this.currentLessonId++;
    const lesson = {
      ...insertLesson,
      id,
      level: insertLesson.level ?? 1,
      xpReward: insertLesson.xpReward ?? 10,
      isLocked: insertLesson.isLocked ?? false
    };
    this.lessons.set(id, lesson);
    return lesson;
  }
  async getUserProgress(userId) {
    return Array.from(this.userProgress.values()).filter((progress) => progress.userId === userId);
  }
  async getLessonProgress(userId, lessonId) {
    const key = `${userId}-${lessonId}`;
    return this.userProgress.get(key);
  }
  async updateProgress(userId, lessonId, progressUpdates) {
    const key = `${userId}-${lessonId}`;
    const existing = this.userProgress.get(key);
    const progress = existing ? { ...existing, ...progressUpdates } : {
      id: this.currentProgressId++,
      userId,
      lessonId,
      completed: false,
      score: 0,
      timeSpent: 0,
      attempts: 0,
      lastAttempt: /* @__PURE__ */ new Date(),
      ...progressUpdates
    };
    this.userProgress.set(key, progress);
    return progress;
  }
  async getUserStats(userId, date) {
    const key = `${userId}-${date}`;
    return this.userStats.get(key);
  }
  async updateStats(userId, date, statsUpdates) {
    const key = `${userId}-${date}`;
    const existing = this.userStats.get(key);
    const stats = existing ? { ...existing, ...statsUpdates } : {
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
  async getUserOverallStats(userId) {
    const user = await this.getUser(userId);
    const userProgressList = await this.getUserProgress(userId);
    const lessonsCompleted = userProgressList.filter((p) => p.completed).length;
    return {
      totalXP: user?.totalXP || 0,
      lessonsCompleted,
      streak: user?.streak || 0
    };
  }
};
var storage = process.env.NODE_ENV === "test" ? new MemStorage() : new MemStorage();

// server/routes.ts
import { z as z2 } from "zod";
import { validationResult } from "express-validator";
var submitAnswerSchema = z2.object({
  lessonId: z2.number().positive(),
  // ID da lição
  questionId: z2.string().min(1),
  // ID único da pergunta
  answer: z2.string().min(1),
  // Resposta do usuário
  timeSpent: z2.number().positive().optional()
  // Tempo gasto em milissegundos
});
var completeQuizSchema = z2.object({
  lessonId: z2.number().positive(),
  // ID da lição
  score: z2.number().min(0).max(100),
  // Pontuação obtida (0-100)
  totalQuestions: z2.number().positive(),
  // Total de perguntas na lição
  timeSpent: z2.number().positive()
  // Tempo total gasto em milissegundos
});
var loginSchema2 = z2.object({
  username: z2.string().min(1),
  // Nome de usuário
  password: z2.string().min(1)
  // Senha
});
var registerSchema = z2.object({
  username: z2.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username deve conter apenas letras, n\xFAmeros e underscores"),
  email: z2.string().email("Email deve ter formato v\xE1lido"),
  password: z2.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(100)
});
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema2.parse(req.body);
      console.log(`Login attempt for username: ${username}`);
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        console.log(`Authentication failed for username: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log(`Authentication successful for username: ${username}`);
      req.session.userId = user.id;
      res.json({ user: { ...user, password: void 0 } });
    } catch (error2) {
      console.error(`Login error:`, error2);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      res.json({ user: { ...user, password: void 0 } });
    } catch (error2) {
      console.error("Registration error:", error2);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/auth/guest", async (req, res) => {
    try {
      const timestamp2 = Date.now();
      const guestUsername = `guest_${timestamp2}`;
      const guestUser = await storage.createUser({
        username: guestUsername,
        email: `${guestUsername}@guest.local`,
        password: "guest_password_" + timestamp2
      });
      req.session.userId = guestUser.id;
      res.json({ user: { ...guestUser, password: void 0 } });
    } catch (error2) {
      console.error("Guest login error:", error2);
      res.status(500).json({ message: "Failed to create guest account" });
    }
  });
  app2.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const updates = req.body;
      const allowedFields = ["username", "email", "dailyGoal"];
      const filteredUpdates = Object.keys(updates).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const user = await storage.updateUser(userId, filteredUpdates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error2) {
      console.error("Error updating user profile:", error2);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  app2.post("/api/user/checkin", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const lastActiveDate = user.lastActiveDate;
      let newStreak = user.streak || 0;
      if (!lastActiveDate || lastActiveDate !== today) {
        if (lastActiveDate) {
          const lastDate = new Date(lastActiveDate);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        const updatedUser = await storage.updateUser(userId, {
          streak: newStreak,
          lastActiveDate: today
        });
        res.json({
          streak: newStreak,
          lastActiveDate: today,
          user: { ...updatedUser, password: void 0 }
        });
      } else {
        res.json({
          streak: newStreak,
          lastActiveDate: today,
          user: { ...user, password: void 0 }
        });
      }
    } catch (error2) {
      console.error("Error updating check-in:", error2);
      res.status(500).json({ message: "Failed to update check-in" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      if (req.session) {
        req.session = null;
      }
      res.json({ message: "Logged out successfully" });
    } catch (error2) {
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error2) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/user", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error2) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/lessons", async (req, res) => {
    try {
      const category = req.query.category;
      const lessons2 = category ? await storage.getLessonsByCategory(category) : await storage.getAllLessons();
      const userProgress2 = await storage.getUserProgress(1);
      const lessonsWithProgress = lessons2.map((lesson) => {
        const progress = userProgress2.find((p) => p.lessonId === lesson.id);
        return {
          ...lesson,
          completed: progress?.completed || false,
          score: progress?.score || 0,
          attempts: progress?.attempts || 0
        };
      });
      res.json(lessonsWithProgress);
    } catch (error2) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });
  app2.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      const progress = await storage.getLessonProgress(1, lessonId);
      res.json({
        ...lesson,
        completed: progress?.completed || false,
        score: progress?.score || 0,
        attempts: progress?.attempts || 0
      });
    } catch (error2) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });
  app2.post("/api/lessons/answer", async (req, res) => {
    try {
      const { lessonId, questionId, answer, timeSpent } = submitAnswerSchema.parse(req.body);
      const userId = req.session?.userId || 1;
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      const questions = lesson.questions;
      const question = questions.find((q) => q.id === questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      const isCorrect = question.correctAnswer === answer;
      const xpEarned = isCorrect ? 10 : 0;
      if (isCorrect && xpEarned > 0) {
        const user = await storage.getUser(userId);
        if (user) {
          const newTotalXP = (user.totalXP || 0) + xpEarned;
          const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
          const today2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          const lastActiveDate = user.lastActiveDate;
          let newStreak = user.streak || 0;
          if (!lastActiveDate || lastActiveDate !== today2) {
            if (lastActiveDate) {
              const lastDate = new Date(lastActiveDate);
              const todayDate = new Date(today2);
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }
            await storage.updateUser(userId, {
              totalXP: newTotalXP,
              level: newLevel,
              streak: newStreak,
              lastActiveDate: today2
            });
          } else {
            await storage.updateUser(userId, {
              totalXP: newTotalXP,
              level: newLevel
            });
          }
        }
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const dailyStats = await storage.getUserStats(userId, today);
        await storage.updateStats(userId, today, {
          xpEarned: (dailyStats?.xpEarned || 0) + xpEarned
        });
      }
      res.json({
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned
      });
    } catch (error2) {
      console.error("Error submitting answer:", error2);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/lessons/complete", async (req, res) => {
    try {
      const { lessonId, score, totalQuestions, timeSpent } = completeQuizSchema.parse(req.body);
      const userId = req.session?.userId || 1;
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      const percentage = Math.round(score / totalQuestions * 100);
      const completed = percentage >= 70;
      const existingProgress = await storage.getLessonProgress(userId, lessonId);
      const attempts = (existingProgress?.attempts || 0) + 1;
      const wasAlreadyCompleted = existingProgress?.completed || false;
      await storage.updateProgress(userId, lessonId, {
        completed,
        score: percentage,
        timeSpent,
        attempts,
        lastAttempt: /* @__PURE__ */ new Date()
      });
      let xpEarned = 0;
      if (completed) {
        const baseXP = lesson.xpReward || 25;
        if (!wasAlreadyCompleted) {
          xpEarned = Math.round(baseXP * (percentage / 100));
        } else {
          const completedAttempts = existingProgress?.attempts || 0;
          const decreaseAmount = 2 * completedAttempts;
          const minXP = 1;
          xpEarned = Math.max(minXP, baseXP - decreaseAmount);
        }
        const user = await storage.getUser(userId);
        if (user) {
          const newTotalXP = (user.totalXP || 0) + xpEarned;
          const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
          const today2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          const lastActiveDate = user.lastActiveDate;
          let newStreak = user.streak || 0;
          if (!lastActiveDate || lastActiveDate !== today2) {
            if (lastActiveDate) {
              const lastDate = new Date(lastActiveDate);
              const todayDate = new Date(today2);
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }
          }
          await storage.updateUser(userId, {
            totalXP: newTotalXP,
            level: newLevel,
            streak: newStreak,
            lastActiveDate: today2
          });
        }
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const dailyStats = await storage.getUserStats(userId, today);
        await storage.updateStats(userId, today, {
          lessonsCompleted: !wasAlreadyCompleted ? (dailyStats?.lessonsCompleted || 0) + 1 : dailyStats?.lessonsCompleted || 0,
          xpEarned: (dailyStats?.xpEarned || 0) + xpEarned,
          timeSpent: (dailyStats?.timeSpent || 0) + timeSpent
        });
      }
      res.json({
        completed,
        score: percentage,
        xpEarned,
        passed: completed,
        attempts,
        isRepeat: wasAlreadyCompleted
      });
    } catch (error2) {
      console.error("Error completing lesson:", error2);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(1);
      const overallStats = await storage.getUserOverallStats(1);
      res.json({
        progress,
        ...overallStats
      });
    } catch (error2) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });
  app2.get("/api/stats/daily", async (req, res) => {
    try {
      const date = req.query.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const stats = await storage.getUserStats(1, date);
      res.json(stats || {
        lessonsCompleted: 0,
        xpEarned: 0,
        timeSpent: 0
      });
    } catch (error2) {
      res.status(500).json({ message: "Failed to fetch daily stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    base: "/"
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "https://5000-iucx5lvmzd0uhg5qou4om-ce882bbe.manusvm.computer",
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://5000-iucx5lvmzd0uhg5qou4om-ce882bbe.manusvm.computer")
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_db();

// server/middleware/validation.ts
import { ZodError } from "zod";

// server/middleware/error-handler.ts
var errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  error(`Error ${status} on ${req.method} ${req.path}: ${message}`, err);
  res.status(status).json({
    message,
    path: req.path,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    // Inclui detalhes adicionais apenas em ambiente de desenvolvimento
    ...process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details || err.errors || void 0
    }
  });
};
var notFoundHandler = (req, res) => {
  error(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};

// server/config/index.ts
var config = {
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10)
};
var requiredEnvVars = ["SESSION_SECRET", "DATABASE_URL"];
var missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);
if (missingEnvVars.length > 0 && config.NODE_ENV === "production") {
  console.error("\u274C Missing required environment variables:", missingEnvVars.join(", "));
  console.error("Please set these environment variables before starting the application");
  process.exit(1);
}
var config_default = config;

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
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
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: true,
  // Permite todas as origens em desenvolvimento
  credentials: true
  // Permite cookies em requisições cross-origin
}));
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader("Cache-Control", "public, max-age=3600, immutable");
  } else if (req.url.startsWith("/api/lessons") || req.url.startsWith("/api/progress")) {
    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
  } else if (req.url.startsWith("/api/user")) {
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
  } else if (req.url.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
  next();
});
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutos
  max: 100,
  // limite de 100 requisições por IP
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutos
  max: 5,
  // limite de 5 requisições de autenticação por IP
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/auth/", authLimiter);
app.use("/api/", limiter);
var PgSession = ConnectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: config_default.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config_default.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1e3
    // 30 dias
  }
}));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  next();
});
(async () => {
  try {
    if (config_default.NODE_ENV === "development") {
      try {
        const { migrateExistingUsers: migrateExistingUsers2 } = await Promise.resolve().then(() => (init_migrate_users(), migrate_users_exports));
        await migrateExistingUsers2();
        log("User migration completed successfully");
        const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seed_data(), seed_data_exports));
        await seedDatabase2();
        log("Database seeding completed successfully");
      } catch (err) {
        error("Error during development setup", err);
      }
    }
    const server = await registerRoutes(app);
    app.use(errorHandler);
    app.use(notFoundHandler);
    if (config_default.NODE_ENV === "development") {
      const { createServer: createServer2 } = await import("vite");
      const vite = await createServer2({
        server: {
          middlewareMode: true,
          hmr: {
            port: 24678,
            host: "0.0.0.0"
          }
        }
      });
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
    } else {
      serveStatic(app);
    }
    server.listen({
      port: config_default.PORT,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`Server running on port ${config_default.PORT} in ${config_default.NODE_ENV} mode`);
    });
  } catch (err) {
    error("Failed to start server", err);
    process.exit(1);
  }
})();
