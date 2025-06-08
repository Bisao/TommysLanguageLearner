
import { db } from "./db";
import { users, lessons, userProgress, userStats } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

interface SeedLesson {
  title: string;
  description: string;
  category: string;
  level: number;
  xpReward: number;
  order: number;
  isLocked: boolean;
  questions: any[];
}

const seedLessons: SeedLesson[] = [
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
        question: "Listen and repeat the sound: /æ/",
        correctAnswer: "/æ/",
        audioUrl: "/audio/vowel-a.mp3",
        explanation: "This is the 'a' sound as in 'cat', 'hat', 'map'."
      }
    ]
  }
];

const seedUsers = [
  {
    username: "demo",
    email: "demo@tommysacademy.com",
    password: "demo123",
    streak: 5,
    totalXP: 150,
    level: 2,
    dailyGoal: 20,
    lastActiveDate: new Date().toISOString().split('T')[0],
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
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ["first_lesson", "week_warrior", "grammar_guru"]
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if data already exists
    const existingLessons = await db.select().from(lessons).limit(1);
    if (existingLessons.length > 0) {
      console.log("📚 Database already seeded, skipping...");
      return;
    }

    // Seed lessons
    console.log("📚 Seeding lessons...");
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

    // Seed demo users
    console.log("👥 Seeding demo users...");
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
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
        createdAt: new Date()
      }).returning();

      // Add some progress for demo users
      if (userData.username === "demo") {
        // Demo user completed first lesson
        await db.insert(userProgress).values({
          userId: user.id,
          lessonId: 1,
          completed: true,
          score: 85,
          timeSpent: 120,
          attempts: 1
        });

        // Add daily stats
        const today = new Date().toISOString().split('T')[0];
        await db.insert(userStats).values({
          userId: user.id,
          date: today,
          lessonsCompleted: 1,
          xpEarned: 10,
          timeSpent: 120
        });
      }

      if (userData.username === "student") {
        // Student completed multiple lessons
        for (let i = 1; i <= 3; i++) {
          await db.insert(userProgress).values({
            userId: user.id,
            lessonId: i,
            completed: true,
            score: 90 + (i * 2),
            timeSpent: 100 + (i * 20),
            attempts: 1
          });
        }

        // Add multiple days of stats
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }

        for (const date of dates) {
          await db.insert(userStats).values({
            userId: user.id,
            date: date,
            lessonsCompleted: Math.floor(Math.random() * 3) + 1,
            xpEarned: Math.floor(Math.random() * 50) + 20,
            timeSpent: Math.floor(Math.random() * 300) + 100
          });
        }
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Demo accounts created:");
    console.log("   - Username: demo, Password: demo123");
    console.log("   - Username: student, Password: student123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");
    
    await db.delete(userStats);
    await db.delete(userProgress);
    await db.delete(lessons);
    await db.delete(users);
    
    console.log("🗑️ Database cleared, re-seeding...");
    await seedDatabase();
    
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}
