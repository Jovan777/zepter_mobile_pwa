import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';

export const notFoundHandler = (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction): void => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      issues: error.issues
    });
    return;
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error instanceof HttpError ? error.details : undefined,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined
  });
};
