import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables.
dotenv.config();

interface SeedBook {
  title: string;
  author: string;
  genre: string;
  price: number;
}

// Singleton database instance.
let dbInstance: Database.Database | null = null;

/**
 * Create and initialize a SQLite database instance.
 * Creates the books table if it doesn't exist.
 *
 * @param dbPath - Optional path to database file. If not provided, uses DATABASE_PATH env var or default.
 * @param shouldSeed - Whether to seed the database with initial data if empty. Defaults to true.
 */
export const initializeDatabase = (dbPath?: string, shouldSeed: boolean = true): Database.Database => {
  const DATABASE_PATH = dbPath || process.env.DATABASE_PATH || './bookstore.db';

  // Create or open the database.
  const db = new Database(DATABASE_PATH);

  // Enable foreign keys.
  db.pragma('foreign_keys = ON');

  // Create books table.
  const createBooksTable = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      price REAL NOT NULL
    )
  `;

  db.exec(createBooksTable);

  // Optionally seed data if table is empty.
  if (shouldSeed) {
    const count = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };

    if (count.count === 0) {
      console.log('Seeding database with initial data...');

      // Load seed data from JSON file.
      const seedDataPath = path.join(__dirname, 'seed-data.json');
      const seedDataRaw = fs.readFileSync(seedDataPath, 'utf-8');
      const seedData: SeedBook[] = JSON.parse(seedDataRaw);

      const insertStmt = db.prepare(
        'INSERT INTO books (title, author, genre, price) VALUES (?, ?, ?, ?)'
      );

      const insertMany = db.transaction((books: SeedBook[]) => {
        for (const book of books) {
          insertStmt.run(book.title, book.author, book.genre, book.price);
        }
      });

      insertMany(seedData);

      console.log(`Seeded ${seedData.length} books into the database.`);
    }
  }

  return db;
};

/**
 * Get the singleton database instance.
 * Initializes the database if not already initialized.
 */
export const getDatabase = (): Database.Database => {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
};

// Export singleton instance for backward compatibility.
const db: Database.Database = getDatabase();
export default db;
