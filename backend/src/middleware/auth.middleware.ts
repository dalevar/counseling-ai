import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { redisClient } from '../utils/redis';
import { RoleName } from '@prisma/client';

export const auth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Silakan login terlebih dahulu');
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Check if token is blacklisted in Redis
    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new ApiError(401, 'Sesi login telah berakhir. Silakan login kembali.');
      }
    }

    // 2. Verify JWT token
    let payload: any;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new ApiError(401, 'Sesi login tidak valid atau telah kedaluwarsa');
    }

    // 3. Attach user to request
    req.user = {
      id: payload.sub as string,
      role: payload.role as RoleName,
    };

    next();
  } catch (error) {
    next(error);
  }
};
