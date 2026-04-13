import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; businessId?: string };
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const decoded = jwt.verify(token, secret) as { sub: string };

    prisma.user.findUnique({ where: { id: decoded.sub } }).then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = { id: user.id, role: user.role, businessId: user.businessId };
      next();
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function roleGuard(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
