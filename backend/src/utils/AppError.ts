/**
 * Lightweight HTTP-aware error. Subclassing the built-in Error is the idiomatic
 * way to carry a status code through Express; the functional-programming rule in
 * this codebase targets domain logic, not Error types.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const notFound = (message = 'Resource not found'): AppError =>
  new AppError(404, message);

export const badRequest = (message = 'Bad request', details?: unknown): AppError =>
  new AppError(400, message, details);

export const conflict = (message = 'Conflict', details?: unknown): AppError =>
  new AppError(409, message, details);
