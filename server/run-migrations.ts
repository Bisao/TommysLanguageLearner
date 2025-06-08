
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function runMigrations() {
  try {
    console.log("🔄 Running database migrations...");
    
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log("✅ Migrations completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations when script is executed directly
runMigrations();

export { runMigrations };
