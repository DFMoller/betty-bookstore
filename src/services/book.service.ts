import { BookRepository } from '../repositories';
import { Book, CreateBookDTO, UpdateBookDTO } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Service for handling business logic related to books.
 */
export class BookService {
  private bookRepository: BookRepository;

  constructor(bookRepository: BookRepository) {
    this.bookRepository = bookRepository;
  }

  /**
   * Create a new book.
   */
  createBook(bookData: CreateBookDTO): Book {
    // Validate price is positive.
    if (bookData.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }

    return this.bookRepository.create(bookData);
  }

  /**
   * Get a book by ID.
   */
  getBookById(id: number): Book {
    const book = this.bookRepository.findById(id);

    if (!book) {
      throw new NotFoundError(`Book with ID ${id} not found`);
    }

    return book;
  }

  /**
   * Get all books.
   */
  getAllBooks(): Book[] {
    return this.bookRepository.findAll();
  }

  /**
   * Get all books by genre.
   */
  getBooksByGenre(genre: string): Book[] {
    return this.bookRepository.findByGenre(genre);
  }

  /**
   * Update a book by ID.
   */
  updateBook(id: number, bookData: UpdateBookDTO): Book {
    // Validate price if provided.
    if (bookData.price !== undefined && bookData.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }

    const updatedBook = this.bookRepository.update(id, bookData);

    if (!updatedBook) {
      throw new NotFoundError(`Book with ID ${id} not found`);
    }

    return updatedBook;
  }

  /**
   * Delete a book by ID.
   */
  deleteBook(id: number): void {
    const deleted = this.bookRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Book with ID ${id} not found`);
    }
  }

  /**
   * Calculate the total discounted price for all books in a specific genre.
   */
  calculateDiscountedPrice(genre: string, discountPercentage: number): number {
    // Validate discount percentage.
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new ValidationError('Discount percentage must be between 0 and 100');
    }

    // Get all books in the specified genre.
    const books = this.bookRepository.findByGenre(genre);

    // Calculate total price.
    const totalPrice = books.reduce((sum, book) => sum + book.price, 0);

    // Apply discount: total_price - (discount_percentage / 100 * total_price).
    const discountedPrice = totalPrice - (discountPercentage / 100) * totalPrice;

    // Round to 2 decimal places for currency.
    return Math.round(discountedPrice * 100) / 100;
  }
}
