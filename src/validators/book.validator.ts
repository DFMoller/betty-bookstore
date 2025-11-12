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
  id: z.coerce.number().int('ID must be a valid integer').positive('ID must be a positive number'),
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
  discount: z.coerce.number().min(0, 'Discount must be at least 0').max(100, 'Discount must be at most 100'),
});
