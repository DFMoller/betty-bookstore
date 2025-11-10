import { Router } from 'express';
import { BookController } from '../controllers';
import { BookService } from '../services';
import { BookRepository } from '../repositories';

/**
 * Create and configure the book routes.
 */
const createBookRoutes = (): Router => {
  const router = Router();

  // Initialize dependencies.
  const bookRepository = new BookRepository();
  const bookService = new BookService(bookRepository);
  const bookController = new BookController(bookService);

  // Note: /books/discounted-price must come before /books/:id to avoid route conflicts.
  router.get('/discounted-price', bookController.getDiscountedPrice);

  // CRUD routes.
  router.post('/', bookController.createBook);
  router.get('/:id', bookController.getBookById);
  router.get('/', bookController.getBooks);
  router.put('/:id', bookController.updateBook);
  router.delete('/:id', bookController.deleteBook);

  return router;
};

export default createBookRoutes;
