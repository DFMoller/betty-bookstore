import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services';
import {
  createBookSchema,
  updateBookSchema,
  bookIdSchema,
  genreQuerySchema,
  discountedPriceQuerySchema,
} from '../validators/book.validator';

/**
 * Controller for handling HTTP requests related to books.
 */
export class BookController {
  private bookService: BookService;

  constructor(bookService: BookService) {
    this.bookService = bookService;
  }

  /**
   * Create a new book.
   */
  createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body.
      const validatedData = createBookSchema.parse(req.body);

      // Create book via service.
      const book = this.bookService.createBook(validatedData);

      // Return 201 Created with the book data.
      res.status(201).json(book);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a book by ID.
   */
  getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate and parse ID parameter.
      const { id } = bookIdSchema.parse(req.params);

      // Get book via service.
      const book = this.bookService.getBookById(id);

      // Return 200 OK with the book data.
      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all books or filter by genre.
   */
  getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if genre query parameter is provided.
      if (req.query.genre) {
        const { genre } = genreQuerySchema.parse(req.query);
        const books = this.bookService.getBooksByGenre(genre);
        res.status(200).json(books);
      } else {
        const books = this.bookService.getAllBooks();
        res.status(200).json(books);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a book by ID.
   */
  updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate and parse ID parameter.
      const { id } = bookIdSchema.parse(req.params);

      // Validate request body.
      const validatedData = updateBookSchema.parse(req.body);

      // Update book via service.
      const book = this.bookService.updateBook(id, validatedData);

      // Return 200 OK with the updated book data.
      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a book by ID.
   */
  deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate and parse ID parameter.
      const { id } = bookIdSchema.parse(req.params);

      // Delete book via service.
      this.bookService.deleteBook(id);

      // Return 204 No Content.
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Calculate discounted price for books by genre.
   */
  getDiscountedPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate query parameters.
      const { genre, discount } = discountedPriceQuerySchema.parse(req.query);

      // Calculate discounted price via service.
      const discountedPrice = this.bookService.calculateDiscountedPrice(genre, discount);

      // Return 200 OK with the discounted price.
      res.status(200).json({ discountedPrice, genre, discount });
    } catch (error) {
      next(error);
    }
  };
}
