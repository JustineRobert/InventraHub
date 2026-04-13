import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, roleGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const businessSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7),
  currency: z.enum(['UGX', 'KES', 'TZS', 'USD']).optional(),
  logoUrl: z.string().url().optional()
});

router.post('/', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const payload = businessSchema.parse(req.body);
    const business = await prisma.business.create({
      data: {
        ...payload,
        currency: payload.currency || 'USD'
      }
    });
    return res.status(201).json(business);
  } catch (error) {
    next(error);
  }
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role === 'ADMIN') {
      const businesses = await prisma.business.findMany({ include: { branches: true, users: true } });
      return res.json(businesses);
    }

    if (!req.user?.businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
      include: { branches: true, users: true }
    });

    if (!business) return res.status(404).json({ error: 'Business not found' });
    return res.json([business]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.businessId !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = businessSchema.partial().parse(req.body);
    const business = await prisma.business.update({ where: { id: req.params.id }, data: payload });
    return res.json(business);
  } catch (error) {
    next(error);
  }
});

export default router;
