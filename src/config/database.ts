import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables.
dotenv.config();

const DATABASE_PATH = process.env.DATABASE_PATH || './bookstore.db';

interface SeedBook {
  title: string;
  author: string;
  genre: string;
  price: number;
}

/**
 * Initialize the SQLite database and create the books table if it doesn't exist.
 * Also insert seed data from JSON file for testing purposes.
 */
const initializeDatabase = (): Database.Database => {
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

  // Check if we need to seed data (only if table is empty).
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

  return db;
};

// Initialize and export the database instance.
export const db: Database.Database = initializeDatabase();

export default db;
