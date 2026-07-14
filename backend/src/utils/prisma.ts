import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Log prisma queries and errors using Winston logger
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

export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database Connected Successfully via Prisma');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  }
};
