import express, { Application } from 'express';
import cors from 'cors';
import { createBookRoutes } from './routes';

/**
 * Create and configure the Express application.
 */
const createApp = (): Application => {
  const app = express();

  // Middleware.
  app.use(cors());
  app.use(express.json());

  // Routes.
  app.use('/books', createBookRoutes());

  // Error handling middleware will be added here in Step 6.6.

  return app;
};

export default createApp;
