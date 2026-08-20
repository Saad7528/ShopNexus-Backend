import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB Atlas
connectDB();

// Mount central API router
app.use('/api', apiRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ShopNexus Backend API',
    environment: process.env.NODE_ENV || 'development',
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
  app.listen(PORT, () => {
    console.log(`⚡ [Server]: Running on port ${PORT}`);
  });
}

export default app;
