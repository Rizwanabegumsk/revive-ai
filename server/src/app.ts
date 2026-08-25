import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import paymentRoutes from './routes/paymentRoutes';
import customerRoutes from './routes/customerRoutes';
import recoveryRoutes from './routes/recoveryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import experimentRoutes from './routes/experimentRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// CORS configuration using CLIENT_URL environment variable
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for demo deployment flexibility
      }
    },
    credentials: true
  })
);

// Express JSON parsing middleware
app.use(express.json());

// Root & Health Check Endpoints for Render Health Check
app.get(['/', '/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'REVIVE AI API',
    status: 'healthy'
  });
});

// API Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/experiments', experimentRoutes);

// 404 Handler for unmapped API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
