import { z } from 'zod';

/**
 * Validation schema for creating a new book.
 */
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  genre: z.string().min(1, 'Genre is required'),
  price: z.number().positive('Price must be greater than 0'),
});

/**
 * Validation schema for updating an existing book.
 */
export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').optional(),
  author: z.string().min(1, 'Author must not be empty').optional(),
  genre: z.string().min(1, 'Genre must not be empty').optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
});

/**
 * Validation schema for book ID parameter.
 */
export const bookIdSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      throw new Error('ID must be a valid number');
    }
    return num;
  }),
});

/**
 * Validation schema for genre query parameter.
 */
export const genreQuerySchema = z.object({
  genre: z.string().min(1, 'Genre is required'),
});

/**
 * Validation schema for discounted price query parameters.
 */
export const discountedPriceQuerySchema = z.object({
  genre: z.string().min(1, 'Genre is required'),
  discount: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error('Discount must be a valid number');
    }
    if (num < 0 || num > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    return num;
  }),
});
