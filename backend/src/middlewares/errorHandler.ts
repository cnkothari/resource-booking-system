import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * 404 handler for unmatched routes. Mounted after all route definitions.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Central error handler. Must keep the 4-arg signature so Express recognises it.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unexpected error — log and return a generic 500.
  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);

  const message =
    err instanceof Error ? err.message : 'Internal server error';

  res.status(500).json({
    success: false,
    message: env.nodeEnv === 'production' ? 'Internal server error' : message,
  });
};
