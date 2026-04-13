import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, path: req.path }, 'Unhandled exception');

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  const status = err && typeof (err as any).status === 'number' ? (err as any).status : 500;
  const message = status === 500 ? 'Internal server error' : (err instanceof Error ? err.message : 'Unexpected error');

  return res.status(status).json({ error: message });
}
