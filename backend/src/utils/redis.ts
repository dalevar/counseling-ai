import { createClient } from 'redis';
import { config } from '../config';
import { logger } from './logger';

const hasRedisUrl = Boolean(config.redis.url?.trim());

export const redisClient = createClient({
  url: config.redis.url || undefined,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!hasRedisUrl) {
      logger.warn('REDIS_URL is not configured. Redis features are disabled.');
      return;
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
  }
};

export const isRedisEnabled = (): boolean => hasRedisUrl;

export const ensureRedisConnection = async (): Promise<void> => {
  if (!hasRedisUrl || redisClient.isOpen) {
    return;
  }

  await connectRedis();
};
