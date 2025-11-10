import express, { Application } from 'express';
import cors from 'cors';
import { createBookRoutes } from './routes';
import { requestLogger, errorHandler } from './middleware';

/**
 * Create and configure the Express application.
 */
const createApp = (): Application => {
  const app = express();

  // Middleware.
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Routes.
  app.use('/books', createBookRoutes());

  // Error handling middleware (must be last).
  app.use(errorHandler);

  return app;
};

export default createApp;
