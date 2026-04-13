import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const transactionSchema = z.object({
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  type: z.enum(['ORDER', 'PAYMENT', 'REFUND', 'ADJUSTMENT']).default('PAYMENT'),
  amount: z.number().positive(),
  currency: z.enum(['UGX', 'KES', 'TZS', 'USD']).default('USD'),
  status: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId } : {};
    const transactions = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(transactions);
  } catch (err) {
    next(err);
  }
});

router.post('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const payload = transactionSchema.parse(req.body);
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }

    if (!payload.orderId && !payload.paymentId) {
      return res.status(400).json({ error: 'Either orderId or paymentId is required' });
    }

    const reference = `TX-${Date.now()}`;
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        businessId,
        createdById: req.user.id,
        type: payload.type,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        metadata: payload.metadata || {}
      }
    });

    return res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

export default router;
