
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
  // Vocabulary Lessons - From PDF Content
  {
    title: "Essential Vocabulary - Food Trends",
    description: "Learn vocabulary from food industry articles",
    category: "vocabulary",
    level: 1,
    xpReward: 20,
    order: 1,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "What does 'trend' mean?",
        options: ["A tradition", "A general direction of change", "A rule", "A problem"],
        correctAnswer: "A general direction of change",
        explanation: "A trend is a general direction in which something is developing or changing."
      },
      {
        id: "2",
        type: "translation",
        question: "Translate 'cork' to Portuguese:",
        correctAnswer: "rolha",
        explanation: "Cork is 'rolha' in Portuguese - the stopper used in bottles."
      },
      {
        id: "3",
        type: "multiple_choice", 
        question: "What is a 'forecast'?",
        options: ["A storm", "A prediction", "A recipe", "A restaurant"],
        correctAnswer: "A prediction",
        explanation: "A forecast is a prediction of what will happen in the future."
      },
      {
        id: "4",
        type: "fill_blank",
        question: "The wine _____ popped out of the bottle.",
        correctAnswer: "cork",
        explanation: "Cork is the material that stoppers wine bottles."
      }
    ]
  },
  {
    title: "Common Verbs - Present to Past",
    description: "Master irregular verbs and their forms",
    category: "vocabulary", 
    level: 1,
    xpReward: 25,
    order: 2,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "What is the past tense of 'read'?",
        options: ["readed", "red", "read", "reading"],
        correctAnswer: "read",
        explanation: "Read is irregular - present: read /riːd/, past: read /red/"
      },
      {
        id: "2",
        type: "multiple_choice",
        question: "What is the past tense of 'come'?",
        options: ["comed", "came", "coming", "cames"],
        correctAnswer: "came",
        explanation: "Come is irregular: come → came → come"
      },
      {
        id: "3",
        type: "fill_blank",
        question: "I _____ with your opinion. (agree)",
        correctAnswer: "agree",
        explanation: "Agree is regular: agree → agreed → agreed"
      },
      {
        id: "4",
        type: "multiple_choice",
        question: "The company will _____ the products tomorrow.",
        options: ["delivery", "deliver", "delivered", "delivering"],
        correctAnswer: "deliver",
        explanation: "After 'will' we use the base form of the verb."
      }
    ]
  },
  {
    title: "Time and Seasons",
    description: "Learn words related to time and weather",
    category: "vocabulary",
    level: 1,
    xpReward: 15,
    order: 3,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "translation",
        question: "Translate 'summer' to Portuguese:",
        correctAnswer: "verão",
        explanation: "Summer is the warm season between spring and autumn."
      },
      {
        id: "2",
        type: "translation", 
        question: "Translate 'winter' to Portuguese:",
        correctAnswer: "inverno",
        explanation: "Winter is the cold season of the year."
      },
      {
        id: "3",
        type: "multiple_choice",
        question: "A 'wave' can mean:",
        options: ["Only water movement", "Only hand gesture", "Both water movement and trends", "Only surfing"],
        correctAnswer: "Both water movement and trends",
        explanation: "Wave can mean ocean waves or metaphorical waves like trends."
      }
    ]
  },
  {
    title: "Connecting Words & Phrases",
    description: "Learn transition words and conjunctions",
    category: "vocabulary",
    level: 2,
    xpReward: 30,
    order: 4,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "What does 'however' mean?",
        options: ["And", "But/Nevertheless", "Because", "When"],
        correctAnswer: "But/Nevertheless",
        explanation: "However shows contrast, similar to 'but' or 'nevertheless'."
      },
      {
        id: "2",
        type: "fill_blank",
        question: "I like coffee. _____, I prefer tea in the evening.",
        correctAnswer: "However",
        explanation: "However introduces a contrasting idea."
      },
      {
        id: "3",
        type: "multiple_choice",
        question: "'Moreover' means:",
        options: ["Less than", "In addition", "Instead of", "Before"],
        correctAnswer: "In addition",
        explanation: "Moreover adds additional information, meaning 'furthermore'."
      },
      {
        id: "4",
        type: "multiple_choice",
        question: "'Therefore' indicates:",
        options: ["Time", "Place", "Result/Conclusion", "Contrast"],
        correctAnswer: "Result/Conclusion", 
        explanation: "Therefore shows a logical result or conclusion."
      }
    ]
  },
  {
    title: "Advanced Descriptive Words",
    description: "Expand your descriptive vocabulary",
    category: "vocabulary",
    level: 2,
    xpReward: 25,
    order: 5,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "What does 'slower' mean?",
        options: ["More fast", "Less fast", "Very fast", "Not fast or slow"],
        correctAnswer: "Less fast",
        explanation: "Slower is the comparative form of slow, meaning less fast."
      },
      {
        id: "2",
        type: "fill_blank",
        question: "The recovery will be much _____ than expected.",
        correctAnswer: "slower",
        explanation: "Slower compares two speeds, showing less speed."
      },
      {
        id: "3",
        type: "multiple_choice",
        question: "'World' can refer to:",
        options: ["Only Earth", "Only people", "Earth, people, or a sphere of activity", "Only countries"],
        correctAnswer: "Earth, people, or a sphere of activity",
        explanation: "World has multiple meanings: the planet, humanity, or a particular sphere."
      }
    ]
  },

  // Grammar Lessons - Based on PDF Content
  {
    title: "Simple Present Tense - Basics",
    description: "Master the most basic tense in English",
    category: "grammar",
    level: 1,
    xpReward: 25,
    order: 6,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "Complete: 'I ___ coffee every morning'",
        options: ["like", "likes", "liking", "liked"],
        correctAnswer: "like",
        explanation: "With I, you, we, they we use the base form of the verb."
      },
      {
        id: "2",
        type: "multiple_choice",
        question: "Complete: 'He ___ coffee every morning'",
        options: ["like", "likes", "liking", "liked"],
        correctAnswer: "likes",
        explanation: "With he, she, it we add 's' to the base form of the verb."
      },
      {
        id: "3",
        type: "multiple_choice",
        question: "Complete: 'They do not ___ coffee'",
        options: ["like", "likes", "liking", "liked"],
        correctAnswer: "like",
        explanation: "In negative sentences with 'do not', we use the base form."
      },
      {
        id: "4",
        type: "multiple_choice",
        question: "Complete: 'Does she ___ coffee?'",
        options: ["like", "likes", "liking", "liked"],
        correctAnswer: "like",
        explanation: "In questions with 'does', we use the base form of the verb."
      }
    ]
  },
  {
    title: "Simple Present - Questions & Negatives",
    description: "Form questions and negative sentences",
    category: "grammar",
    level: 1,
    xpReward: 30,
    order: 7,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "How do you make a question with 'you like pizza'?",
        options: ["You like pizza?", "Do you like pizza?", "Does you like pizza?", "Are you like pizza?"],
        correctAnswer: "Do you like pizza?",
        explanation: "Use 'Do' with I, you, we, they to form questions."
      },
      {
        id: "2",
        type: "multiple_choice",
        question: "How do you make a question with 'he likes pizza'?",
        options: ["Do he like pizza?", "Does he likes pizza?", "Does he like pizza?", "He likes pizza?"],
        correctAnswer: "Does he like pizza?",
        explanation: "Use 'Does' with he, she, it and the base form of the verb."
      },
      {
        id: "3",
        type: "fill_blank",
        question: "I _____ like coffee. (negative)",
        correctAnswer: "do not",
        explanation: "Use 'do not' or 'don't' with I, you, we, they for negatives."
      },
      {
        id: "4",
        type: "fill_blank",
        question: "She _____ like coffee. (negative)",
        correctAnswer: "does not",
        explanation: "Use 'does not' or 'doesn't' with he, she, it for negatives."
      }
    ]
  },
  {
    title: "Emphatic Do",
    description: "Use 'do' for emphasis in positive sentences",
    category: "grammar",
    level: 2,
    xpReward: 20,
    order: 8,
    isLocked: false,
    questions: [
      {
        id: "1",
        type: "multiple_choice",
        question: "When can you use 'do' in positive sentences?",
        options: ["Never", "Always", "For emphasis", "Only in questions"],
        correctAnswer: "For emphasis",
        explanation: "Normally we don't use 'do' in positive sentences, but we can for emphasis."
      },
      {
        id: "2",
        type: "multiple_choice",
        question: "Which shows emphasis?",
        options: ["I like coffee", "I do like coffee", "I am like coffee", "I will like coffee"],
        correctAnswer: "I do like coffee",
        explanation: "'I do like coffee' emphasizes that you really do like coffee."
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

// Run seeding when script is executed directly
seedDatabase()
  .then(() => {
    console.log("Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
