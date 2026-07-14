import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
    [key: string]: any;
  };
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  meta?: ApiResponse['meta']
): Response => {
  return sendResponse(res, 200, message, data, meta);
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
): Response => {
  return sendResponse(res, 201, message, data);
};
