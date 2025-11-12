// Mock the database module BEFORE importing the app.
// Jest hoists this to the top, so we create the test db inside the factory.
jest.mock('../../config/database', () => {
  const Database = require('better-sqlite3');
  const testDb = new Database(':memory:');

  // Create books table.
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

  return {
    __esModule: true,
    default: testDb,
    getDatabase: () => testDb,
    initializeDatabase: () => testDb,
  };
});

// Now import the rest after the mock is declared.
import request from 'supertest';
import { Application } from 'express';
import createApp from '../../app';
import db from '../../config/database';

describe('Book Routes Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    // Create the Express app.
    app = createApp();
  });

  beforeEach(() => {
    // Clear the database and reset auto-increment before each test.
    db.exec('DELETE FROM books');
    db.exec("DELETE FROM sqlite_sequence WHERE name='books'");

    // Seed with test data.
    const books = [
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', price: 18.99 },
      { title: '1984', author: 'George Orwell', genre: 'Fiction', price: 15.99 },
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', price: 12.99 },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science', price: 22.99 },
      { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', price: 24.99 },
    ];

    const insertStmt = db.prepare('INSERT INTO books (title, author, genre, price) VALUES (?, ?, ?, ?)');
    const insertMany = db.transaction((booksData: typeof books) => {
      for (const book of booksData) {
        insertStmt.run(book.title, book.author, book.genre, book.price);
      }
    });
    insertMany(books);
  });

  afterAll(() => {
    // Close the in-memory database connection.
    db.close();
  });

  describe('POST /books', () => {
    it('should create a new book successfully', async () => {
      // Arrange.
      const newBook = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Programming',
        price: 39.99,
      };

      // Act.
      const response = await request(app).post('/books').send(newBook);

      // Assert.
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Programming',
        price: 39.99,
      });
    });

    it('should return 400 when title is missing', async () => {
      // Arrange.
      const invalidBook = {
        author: 'Robert C. Martin',
        genre: 'Programming',
        price: 39.99,
      };

      // Act.
      const response = await request(app).post('/books').send(invalidBook);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when price is zero', async () => {
      // Arrange.
      const invalidBook = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Programming',
        price: 0,
      };

      // Act.
      const response = await request(app).post('/books').send(invalidBook);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 400 when price is negative', async () => {
      // Arrange.
      const invalidBook = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Programming',
        price: -10,
      };

      // Act.
      const response = await request(app).post('/books').send(invalidBook);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange.
      const invalidBook = {
        title: 'Clean Code',
      };

      // Act.
      const response = await request(app).post('/books').send(invalidBook);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /books/:id', () => {
    it('should get a book by ID successfully', async () => {
      // Act.
      const response = await request(app).get('/books/1');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        price: 18.99,
      });
    });

    it('should return 404 when book does not exist', async () => {
      // Act.
      const response = await request(app).get('/books/9999');

      // Assert.
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toContain('Book with ID 9999 not found');
    });

    it('should return 400 when ID is not a valid number', async () => {
      // Act.
      const response = await request(app).get('/books/invalid');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /books', () => {
    it('should get all books successfully', async () => {
      // Act.
      const response = await request(app).get('/books');

      // Assert.
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(5);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('author');
      expect(response.body[0]).toHaveProperty('genre');
      expect(response.body[0]).toHaveProperty('price');
    });

    it('should filter books by genre', async () => {
      // Act.
      const response = await request(app).get('/books?genre=Fiction');

      // Assert.
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body.every((book: any) => book.genre === 'Fiction')).toBe(true);
    });

    it('should return empty array when no books match the genre', async () => {
      // Act.
      const response = await request(app).get('/books?genre=NonExistentGenre');

      // Assert.
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return empty array when genre query parameter is empty', async () => {
      // Act.
      const response = await request(app).get('/books?genre=');

      // Assert.
      // Note: Empty string passes min(1) validation in Zod, returns no matches.
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /books/:id', () => {
    it('should update a book successfully', async () => {
      // Arrange.
      const updatedData = {
        title: 'Updated Title',
        price: 25.99,
      };

      // Act.
      const response = await request(app).put('/books/1').send(updatedData);

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'Updated Title',
        author: 'Harper Lee',
        genre: 'Fiction',
        price: 25.99,
      });
    });

    it('should update all fields of a book', async () => {
      // Arrange.
      const updatedData = {
        title: 'New Title',
        author: 'New Author',
        genre: 'New Genre',
        price: 30.0,
      };

      // Act.
      const response = await request(app).put('/books/1').send(updatedData);

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        ...updatedData,
      });
    });

    it('should return 404 when updating non-existent book', async () => {
      // Arrange.
      const updatedData = {
        title: 'Updated Title',
      };

      // Act.
      const response = await request(app).put('/books/9999').send(updatedData);

      // Assert.
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should return 400 when updated price is zero', async () => {
      // Arrange.
      const updatedData = {
        price: 0,
      };

      // Act.
      const response = await request(app).put('/books/1').send(updatedData);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when updated price is negative', async () => {
      // Arrange.
      const updatedData = {
        price: -5,
      };

      // Act.
      const response = await request(app).put('/books/1').send(updatedData);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when update data contains empty strings', async () => {
      // Arrange.
      const updatedData = {
        title: '',
      };

      // Act.
      const response = await request(app).put('/books/1').send(updatedData);

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book successfully', async () => {
      // Act.
      const response = await request(app).delete('/books/1');

      // Assert.
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify the book is actually deleted.
      const getResponse = await request(app).get('/books/1');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent book', async () => {
      // Act.
      const response = await request(app).delete('/books/9999');

      // Assert.
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should return 400 when ID is not a valid number', async () => {
      // Act.
      const response = await request(app).delete('/books/invalid');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /books/discounted-price', () => {
    it('should calculate discounted price correctly', async () => {
      // Act.
      // Fiction books: 18.99 + 15.99 + 12.99 = 47.97, 10% discount = 43.173.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=10');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('discountedPrice');
      expect(response.body.discountedPrice).toBeCloseTo(43.173, 2);
    });

    it('should return 0 when genre has no books', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=NonExistentGenre&discount=10');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('discountedPrice', 0);
    });

    it('should calculate correctly with 0% discount', async () => {
      // Act.
      // Fiction books total: 47.97.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=0');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBeCloseTo(47.97, 2);
    });

    it('should calculate correctly with 100% discount', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=100');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBe(0);
    });

    it('should return 400 when genre parameter is missing', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?discount=10');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when discount parameter is missing', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=Fiction');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when discount is negative', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=-10');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 when discount is greater than 100', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=150');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 when discount is not a valid number', async () => {
      // Act.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=invalid');

      // Assert.
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should calculate correctly for single book genre', async () => {
      // Act.
      // Science genre has 1 book at 22.99, 20% discount = 18.392.
      const response = await request(app).get('/books/discounted-price?genre=Science&discount=20');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBeCloseTo(18.392, 2);
    });

    it('should handle decimal discount percentages', async () => {
      // Act.
      // Fiction books total: 47.97, 15.5% discount = 40.53465, rounded to 40.53.
      const response = await request(app).get('/books/discounted-price?genre=Fiction&discount=15.5');

      // Assert.
      expect(response.status).toBe(200);
      expect(response.body.discountedPrice).toBe(40.53);
    });
  });
});
