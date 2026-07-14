import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Log the error
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, {
    stack: err.stack,
    error: err,
  });

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Resource already exists';
      const targets = err.meta?.target as string[];
      errors = targets ? { fields: targets } : undefined;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
