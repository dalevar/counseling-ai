import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaListenersAttached?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

if (!globalForPrisma.prismaListenersAttached) {
  // Avoid duplicate listeners across hot reloads and serverless reuse.
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });

  prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
  });

  prisma.$on('warn', (e) => {
    logger.warn(`Prisma Warning: ${e.message}`);
  });

  prisma.$on('info', (e) => {
    logger.info(`Prisma Info: ${e.message}`);
  });

  globalForPrisma.prismaListenersAttached = true;
}

export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database Connected Successfully via Prisma');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    throw error;
  }
};
