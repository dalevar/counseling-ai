import app from './app';
import { bootstrapApplication } from './bootstrap';
import { config } from './config';
import { logger } from './utils/logger';
import { initializeSocket } from './sockets';

async function startServer(): Promise<void> {
  await bootstrapApplication();

  const server = app.listen(config.port, () => {
    logger.info(`=================================`);
    logger.info(`  Server running in ${config.env} mode`);
    logger.info(`  Listening on http://localhost:${config.port}`);
    logger.info(`=================================`);
  });

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
}

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection at Promise', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception thrown', error);
  process.exit(1);
});

void startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
