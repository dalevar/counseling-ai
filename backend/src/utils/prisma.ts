import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

/**
 * Prisma Client dengan event logging
 */
const prismaClient = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

/**
 * Ambil tipe PrismaClient yang sudah memiliki Event Emitter
 */
type PrismaClientWithEvents = typeof prismaClient;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithEvents | undefined;

  // eslint-disable-next-line no-var
  var prismaListenersAttached: boolean | undefined;
}

/**
 * Singleton Prisma
 */
export const prisma: PrismaClientWithEvents = global.prisma ?? prismaClient;

if (!global.prisma) {
  global.prisma = prisma;
}

/**
 * Hindari duplicate listener ketika hot reload
 */
if (!global.prismaListenersAttached) {
  prisma.$on('query', (event: Prisma.QueryEvent) => {
    logger.debug('Prisma Query', {
      query: event.query,
      params: event.params,
      duration: event.duration,
      target: event.target,
    });
  });

  prisma.$on('info', (event: Prisma.LogEvent) => {
    logger.info('Prisma Info', {
      message: event.message,
      target: event.target,
    });
  });

  prisma.$on('warn', (event: Prisma.LogEvent) => {
    logger.warn('Prisma Warning', {
      message: event.message,
      target: event.target,
    });
  });

  prisma.$on('error', (event: Prisma.LogEvent) => {
    logger.error('Prisma Error', {
      message: event.message,
      target: event.target,
    });
  });

  global.prismaListenersAttached = true;
}

/**
 * Connect Database
 */
export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();

    logger.info('Database Connected Successfully');
  } catch (error) {
    logger.error('Database Connection Failed', error);

    throw error;
  }
};

/**
 * Disconnect Database
 */
export const disconnectDb = async (): Promise<void> => {
  try {
    await prisma.$disconnect();

    logger.info('Database Disconnected');
  } catch (error) {
    logger.error('Disconnect Failed', error);

    throw error;
  }
};

export default prisma;
