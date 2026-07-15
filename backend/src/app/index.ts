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

// ===============================
// REDIS
// Disable sementara saat deploy Vercel
// ===============================

// import {
//   ensureRedisConnection,
//   isRedisEnabled,
//   redisClient,
// } from '../utils/redis';

const app: Application = express();
const isVercel = Boolean(process.env.VERCEL);
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
const swaggerDocumentPath = path.resolve(process.cwd(), 'src/docs/swagger.json');

/* ==========================================================
   REQUEST ID
========================================================== */

app.use((req: Request, _res: Response, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();

  next();
});

/* ==========================================================
   SECURITY
========================================================== */

app.use(helmet());

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

/* ==========================================================
   RATE LIMIT
========================================================== */

app.use('/api', apiLimiter);

/* ==========================================================
   BODY PARSER
========================================================== */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* ==========================================================
   STATIC
========================================================== */

if (!isVercel) {
  app.use('/uploads', express.static(uploadsDirectory));
}

/* ==========================================================
   ROOT
========================================================== */

app.get('/', (_req: Request, res: Response) => {
  return sendResponse(res, 200, 'EduCouns AI Backend Running', {
    name: 'EduCouns AI',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================
   API ROOT
========================================================== */

app.get('/api', (_req: Request, res: Response) => {
  return sendResponse(res, 200, 'EduCouns AI API', {
    version: '1.0.0',
    status: 'running',

    endpoints: {
      root: '/',
      health: '/health',
      docs: '/api-docs',

      auth: '/api/v1/auth',
      users: '/api/v1/users',
      counseling: '/api/v1/counseling',
      ai: '/api/v1/ai',
      journals: '/api/v1/journals',
      notifications: '/api/v1/notifications',
      admin: '/api/v1/admin',
    },
  });
});

/* ==========================================================
   ROUTES
========================================================== */

app.use('/api/v1/auth', authLimiter, authRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/counseling', counselingRouter);

app.use('/api/v1/ai/chat', aiChatLimiter);

app.use('/api/v1/ai', aiRouter);

app.use('/api/v1/journals', journalRouter);

app.use('/api/v1/notifications', notificationRouter);

app.use('/api/v1/admin', adminRouter);

/* ==========================================================
   SWAGGER
========================================================== */

app.get('/api-docs', (_req: Request, res: Response) => {
  res.sendFile(swaggerDocumentPath);
});

/* ==========================================================
   HEALTH CHECK
========================================================== */

app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  const status = dbStatus === 'healthy' ? 200 : 503;

  return sendResponse(
    res,
    status,
    dbStatus === 'healthy' ? 'EduCouns AI Backend is healthy!' : 'Database connection failed',
    {
      env: config.env,
      timestamp: new Date().toISOString(),

      services: {
        database: dbStatus,
        redis: 'disabled',
      },
    },
  );
});

/* ==========================================================
   404
========================================================== */

app.use((_req: Request, res: Response) => {
  return sendResponse(res, 404, 'Endpoint not found');
});

/* ==========================================================
   ERROR HANDLER
========================================================== */

app.use(errorHandler);

export default app;
