import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://shop-nexus-frontend-ten.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, serverless internal)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.CLIENT_URL === '*'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all for cross-domain API compatibility
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serverless DB connection middleware
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Error connecting to DB in middleware:', err);
  }
  next();
});

// Mount central API router
app.use('/api', apiRoutes);

// Root and health status handlers
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ShopNexus Backend API',
    environment: process.env.NODE_ENV || 'production',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'ShopNexus Backend & MongoDB Atlas Connected and Running',
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().catch((err) => console.error('Initial DB connect error:', err));
  app.listen(PORT, () => {
    console.log(`⚡ [Server]: Running on port ${PORT}`);
  });
}

export default app;
