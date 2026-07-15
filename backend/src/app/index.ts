import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { randomUUID } from 'crypto';
import { config } from '../config';
import { errorHandler } from '../middleware/errorHandler';
import { sendResponse } from '../helpers/response';
import { apiLimiter, authLimiter, aiChatLimiter } from '../middleware/rateLimit.middleware';
import authRouter from '../routes/auth.routes';
import userRouter from '../routes/user.routes';
import counselingRouter from '../routes/counseling.routes';
import aiRouter from '../routes/ai.routes';
import journalRouter from '../routes/journal.routes';
import notificationRouter from '../routes/notification.routes';
import adminRouter from '../routes/admin.routes';
import { prisma } from '../utils/prisma';
import { ensureRedisConnection, isRedisEnabled, redisClient } from '../utils/redis';

const app: Application = express();

// Correlation ID (Request ID) middleware
app.use((req: Request, _res: Response, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();
  next();
});

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Apply global API rate limiter
app.use('/api/', apiLimiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/counseling', counselingRouter);
app.use('/api/v1/ai/chat', aiChatLimiter); // extra limiter specifically on chat
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/journals', journalRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);

// Swagger Docs Route
app.get('/api-docs', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../docs/swagger.json'));
});

// Health Check Route — with DB & Redis probe
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let redisStatus = isRedisEnabled() ? 'healthy' : 'disabled';

  try { await prisma.$queryRaw`SELECT 1`; } catch { dbStatus = 'unhealthy'; }
  if (isRedisEnabled()) {
    try {
      await ensureRedisConnection();
      await redisClient.ping();
    } catch {
      redisStatus = 'unhealthy';
    }
  }

  const isHealthy = dbStatus === 'healthy' && redisStatus !== 'unhealthy';
  const status = isHealthy ? 200 : 503;

  sendResponse(res, status, isHealthy ? 'EduCouns AI Backend is healthy!' : 'Service degraded', {
    env: config.env,
    timestamp: new Date().toISOString(),
    services: { database: dbStatus, redis: redisStatus },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
