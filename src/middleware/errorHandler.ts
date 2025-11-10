import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

/**
 * Centralized error handling middleware.
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error.
  logger.error(`Error: ${error.message}`, { error: error.stack });

  // Handle Zod validation errors.
  if (error instanceof ZodError) {
    const messages = error.issues.map((err: ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages,
        statusCode: 400,
      },
    });
    return;
  }

  // Handle custom AppError instances.
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
    });
    return;
  }

  // Handle generic errors.
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      statusCode: 500,
    },
  });
};
