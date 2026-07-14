import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectRedis } from './utils/redis';
import { connectDb } from './utils/prisma';
import { initializeSocket } from './sockets';

const server = app.listen(config.port, async () => {
  logger.info(`=================================`);
  logger.info(`  Server running in ${config.env} mode`);
  logger.info(`  Listening on http://localhost:${config.port}`);
  logger.info(`=================================`);

  // Connect to Database
  await connectDb();

  // Connect to Redis
  await connectRedis();
});

// Attach Socket.IO
initializeSocket(server);

const handleExit = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection at Promise', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception thrown', error);
  process.exit(1);
});
