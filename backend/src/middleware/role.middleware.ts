import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { RoleName } from '@prisma/client';

export const authorize = (...roles: RoleName[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Anda tidak memiliki hak akses untuk fitur ini');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
