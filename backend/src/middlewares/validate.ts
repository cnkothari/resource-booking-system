import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { badRequest } from '../utils/AppError';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Returns an Express middleware that validates the given request part against a
 * Joi schema. On success the parsed/coerced value replaces the original so
 * downstream layers receive clean, typed data.
 */
export const validate =
  (schema: ObjectSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      next(badRequest('Validation failed', details));
      return;
    }

    // `query` is a getter-only property in Express 5; assign defensively.
    Object.assign(req[part] as object, value);
    next();
  };
