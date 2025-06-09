import express from 'express';
<<<<<<< HEAD
=======
import cors from 'cors';
>>>>>>> master
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './api/routes';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

const app = express();

<<<<<<< HEAD
=======
// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

>>>>>>> master
// Middleware
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use(limiter);

// Routes
app.use('/api', routes);

// Root path
app.get('/', (req, res) => {
  res.json({
    message: 'Insurance Quote Scraper API',
    endpoints: {
      quotes: 'POST /api/quotes'
    }
  });
});

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

export default app;