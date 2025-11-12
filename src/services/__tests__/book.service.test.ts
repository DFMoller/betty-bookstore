// Mock the database module BEFORE any imports.
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {}, // Mock database object (not used in unit tests).
  getDatabase: jest.fn(),
  initializeDatabase: jest.fn(),
}));

import { BookService } from '../book.service';
import { BookRepository } from '../../repositories/book.repository';
import { Book, CreateBookDTO, UpdateBookDTO } from '../../models';
import { NotFoundError, ValidationError } from '../../utils/errors';

// Mock the BookRepository.
jest.mock('../../repositories/book.repository');

describe('BookService', () => {
  let bookService: BookService;
  let mockBookRepository: jest.Mocked<BookRepository>;

  beforeEach(() => {
    // Clear all mocks before each test.
    jest.clearAllMocks();

    // Create a mocked instance of BookRepository.
    mockBookRepository = new BookRepository() as jest.Mocked<BookRepository>;

    // Create an instance of BookService with the mocked repository.
    bookService = new BookService(mockBookRepository);
  });

  describe('createBook', () => {
    it('should create a book successfully', () => {
      // Arrange.
      const createBookDTO: CreateBookDTO = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        price: 29.99,
      };

      const expectedBook: Book = {
        id: 1,
        ...createBookDTO,
      };

      mockBookRepository.create.mockReturnValue(expectedBook);

      // Act.
      const result = bookService.createBook(createBookDTO);

      // Assert.
      expect(result).toEqual(expectedBook);
      expect(mockBookRepository.create).toHaveBeenCalledWith(createBookDTO);
      expect(mockBookRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ValidationError when price is 0', () => {
      // Arrange.
      const createBookDTO: CreateBookDTO = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        price: 0,
      };

      // Act & Assert.
      expect(() => bookService.createBook(createBookDTO)).toThrow(ValidationError);
      expect(() => bookService.createBook(createBookDTO)).toThrow('Price must be greater than 0');
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when price is negative', () => {
      // Arrange.
      const createBookDTO: CreateBookDTO = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        price: -10,
      };

      // Act & Assert.
      expect(() => bookService.createBook(createBookDTO)).toThrow(ValidationError);
      expect(() => bookService.createBook(createBookDTO)).toThrow('Price must be greater than 0');
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getBookById', () => {
    it('should return a book when it exists', () => {
      // Arrange.
      const bookId = 1;
      const expectedBook: Book = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        price: 29.99,
      };

      mockBookRepository.findById.mockReturnValue(expectedBook);

      // Act.
      const result = bookService.getBookById(bookId);

      // Assert.
      expect(result).toEqual(expectedBook);
      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when book does not exist', () => {
      // Arrange.
      const bookId = 999;
      mockBookRepository.findById.mockReturnValue(null);

      // Act & Assert.
      expect(() => bookService.getBookById(bookId)).toThrow(NotFoundError);
      expect(() => bookService.getBookById(bookId)).toThrow(`Book with ID ${bookId} not found`);
      expect(mockBookRepository.findById).toHaveBeenCalledWith(bookId);
    });
  });

  describe('getAllBooks', () => {
    it('should return all books', () => {
      // Arrange.
      const expectedBooks: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 29.99 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Science', price: 39.99 },
      ];

      mockBookRepository.findAll.mockReturnValue(expectedBooks);

      // Act.
      const result = bookService.getAllBooks();

      // Assert.
      expect(result).toEqual(expectedBooks);
      expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no books exist', () => {
      // Arrange.
      mockBookRepository.findAll.mockReturnValue([]);

      // Act.
      const result = bookService.getAllBooks();

      // Assert.
      expect(result).toEqual([]);
      expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBooksByGenre', () => {
    it('should return books matching the genre', () => {
      // Arrange.
      const genre = 'Fiction';
      const expectedBooks: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 29.99 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Fiction', price: 39.99 },
      ];

      mockBookRepository.findByGenre.mockReturnValue(expectedBooks);

      // Act.
      const result = bookService.getBooksByGenre(genre);

      // Assert.
      expect(result).toEqual(expectedBooks);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no books match the genre', () => {
      // Arrange.
      const genre = 'NonExistentGenre';
      mockBookRepository.findByGenre.mockReturnValue([]);

      // Act.
      const result = bookService.getBooksByGenre(genre);

      // Assert.
      expect(result).toEqual([]);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', () => {
      // Arrange.
      const bookId = 1;
      const updateBookDTO: UpdateBookDTO = {
        title: 'Updated Title',
        price: 35.99,
      };

      const expectedBook: Book = {
        id: bookId,
        title: 'Updated Title',
        author: 'Test Author',
        genre: 'Fiction',
        price: 35.99,
      };

      mockBookRepository.update.mockReturnValue(expectedBook);

      // Act.
      const result = bookService.updateBook(bookId, updateBookDTO);

      // Assert.
      expect(result).toEqual(expectedBook);
      expect(mockBookRepository.update).toHaveBeenCalledWith(bookId, updateBookDTO);
      expect(mockBookRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw ValidationError when updated price is 0', () => {
      // Arrange.
      const bookId = 1;
      const updateBookDTO: UpdateBookDTO = {
        price: 0,
      };

      // Act & Assert.
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow(ValidationError);
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow('Price must be greater than 0');
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when updated price is negative', () => {
      // Arrange.
      const bookId = 1;
      const updateBookDTO: UpdateBookDTO = {
        price: -5,
      };

      // Act & Assert.
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow(ValidationError);
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow('Price must be greater than 0');
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when book does not exist', () => {
      // Arrange.
      const bookId = 999;
      const updateBookDTO: UpdateBookDTO = {
        title: 'Updated Title',
      };

      mockBookRepository.update.mockReturnValue(null);

      // Act & Assert.
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow(NotFoundError);
      expect(() => bookService.updateBook(bookId, updateBookDTO)).toThrow(`Book with ID ${bookId} not found`);
      expect(mockBookRepository.update).toHaveBeenCalledWith(bookId, updateBookDTO);
    });

    it('should update book successfully without price validation when price is not provided', () => {
      // Arrange.
      const bookId = 1;
      const updateBookDTO: UpdateBookDTO = {
        title: 'Updated Title',
        author: 'Updated Author',
      };

      const expectedBook: Book = {
        id: bookId,
        title: 'Updated Title',
        author: 'Updated Author',
        genre: 'Fiction',
        price: 29.99,
      };

      mockBookRepository.update.mockReturnValue(expectedBook);

      // Act.
      const result = bookService.updateBook(bookId, updateBookDTO);

      // Assert.
      expect(result).toEqual(expectedBook);
      expect(mockBookRepository.update).toHaveBeenCalledWith(bookId, updateBookDTO);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', () => {
      // Arrange.
      const bookId = 1;
      mockBookRepository.delete.mockReturnValue(true);

      // Act.
      bookService.deleteBook(bookId);

      // Assert.
      expect(mockBookRepository.delete).toHaveBeenCalledWith(bookId);
      expect(mockBookRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when book does not exist', () => {
      // Arrange.
      const bookId = 999;
      mockBookRepository.delete.mockReturnValue(false);

      // Act & Assert.
      expect(() => bookService.deleteBook(bookId)).toThrow(NotFoundError);
      expect(() => bookService.deleteBook(bookId)).toThrow(`Book with ID ${bookId} not found`);
      expect(mockBookRepository.delete).toHaveBeenCalledWith(bookId);
    });
  });

  describe('calculateDiscountedPrice', () => {
    it('should calculate discounted price correctly with valid discount', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 10;
      const books: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 50 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Fiction', price: 75 },
      ];

      mockBookRepository.findByGenre.mockReturnValue(books);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      // Total: 50 + 75 = 125, Discount: 10% of 125 = 12.5, Result: 125 - 12.5 = 112.5.
      expect(result).toBe(112.5);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
    });

    it('should return 0 when genre has no books', () => {
      // Arrange.
      const genre = 'NonExistentGenre';
      const discountPercentage = 10;

      mockBookRepository.findByGenre.mockReturnValue([]);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      expect(result).toBe(0);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
    });

    it('should calculate correctly with 0% discount', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 0;
      const books: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 50 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Fiction', price: 75 },
      ];

      mockBookRepository.findByGenre.mockReturnValue(books);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      // Total: 125, Discount: 0%, Result: 125.
      expect(result).toBe(125);
    });

    it('should calculate correctly with 100% discount', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 100;
      const books: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 50 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Fiction', price: 75 },
      ];

      mockBookRepository.findByGenre.mockReturnValue(books);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      // Total: 125, Discount: 100%, Result: 0.
      expect(result).toBe(0);
    });

    it('should throw ValidationError when discount is negative', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = -10;

      // Act & Assert.
      expect(() => bookService.calculateDiscountedPrice(genre, discountPercentage)).toThrow(ValidationError);
      expect(() => bookService.calculateDiscountedPrice(genre, discountPercentage)).toThrow(
        'Discount percentage must be between 0 and 100'
      );
      expect(mockBookRepository.findByGenre).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when discount is greater than 100', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 150;

      // Act & Assert.
      expect(() => bookService.calculateDiscountedPrice(genre, discountPercentage)).toThrow(ValidationError);
      expect(() => bookService.calculateDiscountedPrice(genre, discountPercentage)).toThrow(
        'Discount percentage must be between 0 and 100'
      );
      expect(mockBookRepository.findByGenre).not.toHaveBeenCalled();
    });

    it('should handle decimal prices correctly', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 15;
      const books: Book[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 19.99 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Fiction', price: 29.99 },
        { id: 3, title: 'Book 3', author: 'Author 3', genre: 'Fiction', price: 9.99 },
      ];

      mockBookRepository.findByGenre.mockReturnValue(books);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      // Total: 19.99 + 29.99 + 9.99 = 59.97, Discount: 15% of 59.97 = 8.9955, Result: 59.97 - 8.9955 = 50.9745.
      expect(result).toBeCloseTo(50.9745, 2);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
    });

    it('should calculate correctly with single book in genre', () => {
      // Arrange.
      const genre = 'Fiction';
      const discountPercentage = 20;
      const books: Book[] = [{ id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', price: 100 }];

      mockBookRepository.findByGenre.mockReturnValue(books);

      // Act.
      const result = bookService.calculateDiscountedPrice(genre, discountPercentage);

      // Assert.
      // Total: 100, Discount: 20% of 100 = 20, Result: 80.
      expect(result).toBe(80);
      expect(mockBookRepository.findByGenre).toHaveBeenCalledWith(genre);
    });
  });
});
