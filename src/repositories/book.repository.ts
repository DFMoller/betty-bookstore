import db from '../config/database';
import { Book, CreateBookDTO, UpdateBookDTO } from '../models';

/**
 * Repository for handling database operations related to books.
 */
export class BookRepository {
  /**
   * Create a new book in the database.
   */
  create(bookData: CreateBookDTO): Book {
    const stmt = db.prepare('INSERT INTO books (title, author, genre, price) VALUES (?, ?, ?, ?)');

    const result = stmt.run(bookData.title, bookData.author, bookData.genre, bookData.price);

    const book: Book = {
      id: result.lastInsertRowid as number,
      ...bookData,
    };

    return book;
  }

  /**
   * Find a book by its ID.
   */
  findById(id: number): Book | null {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(id) as Book | undefined;

    return book || null;
  }

  /**
   * Find all books in the database.
   */
  findAll(): Book[] {
    const stmt = db.prepare('SELECT * FROM books');
    const books = stmt.all() as Book[];

    return books;
  }

  /**
   * Find all books by genre.
   */
  findByGenre(genre: string): Book[] {
    const stmt = db.prepare('SELECT * FROM books WHERE genre = ?');
    const books = stmt.all(genre) as Book[];

    return books;
  }

  /**
   * Update an existing book by ID.
   */
  update(id: number, bookData: UpdateBookDTO): Book | null {
    // First check if the book exists.
    const existingBook = this.findById(id);
    if (!existingBook) {
      return null;
    }

    // Build dynamic UPDATE query based on provided fields.
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (bookData.title !== undefined) {
      updates.push('title = ?');
      values.push(bookData.title);
    }
    if (bookData.author !== undefined) {
      updates.push('author = ?');
      values.push(bookData.author);
    }
    if (bookData.genre !== undefined) {
      updates.push('genre = ?');
      values.push(bookData.genre);
    }
    if (bookData.price !== undefined) {
      updates.push('price = ?');
      values.push(bookData.price);
    }

    // If no fields to update, return the existing book.
    if (updates.length === 0) {
      return existingBook;
    }

    // Add the id to the values array for the WHERE clause.
    values.push(id);

    const query = `UPDATE books SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    // Return the updated book.
    return this.findById(id);
  }

  /**
   * Delete a book by ID.
   */
  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }
}
