import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDb } from '../src/utils/prisma';

let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return;

  console.log('[BOOTSTRAP] Connecting database...');

  await connectDb();

  console.log('[BOOTSTRAP] Database connected');

  isInitialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await bootstrap();

    return app(req, res);
  } catch (error: any) {
    console.error('[BOOTSTRAP ERROR]', error);

    return res.status(500).json({
      success: false,
      message: error?.message ?? 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}
