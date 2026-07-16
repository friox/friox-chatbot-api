import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import path from "path";

function runMigration() {
  try {
    const targetDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const dbPath = './data/data.db'
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    process.exit(0);
  } catch (error) {
    console.error(`Failed to run migration: ${error}`);
    process.exit(1);
  }
}

runMigration();
