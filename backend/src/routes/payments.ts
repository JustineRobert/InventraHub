import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, roleGuard, AuthRequest } from '../middleware/auth';
import { createMobileMoneyPayment, verifyMobileMoneyPayment } from '../services/mobileMoney';

const router = Router();

const paymentSchema = z.object({
  orderId: z.string(),
  businessId: z.string(),
  provider: z.enum(['MTN_MOMO', 'AIRTEL_MONEY', 'BANK_CARD', 'PAYPAL']).default('MTN_MOMO'),
  amount: z.number().positive(),
  currency: z.enum(['UGX', 'KES', 'TZS', 'USD']).default('USD')
});

router.post('/', authGuard, roleGuard(['ADMIN', 'MANAGER', 'SALES']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload = paymentSchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: payload.orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const reference = `PAY-${Date.now()}`;
    const result = await createMobileMoneyPayment({ orderId: payload.orderId, amount: payload.amount, provider: payload.provider, reference });

    const payment = await prisma.payment.create({
      data: {
        orderId: payload.orderId,
        businessId: payload.businessId,
        method: payload.provider,
        provider: payload.provider,
        reference,
        amount: payload.amount,
        currency: payload.currency,
        status: result.status,
        receiptUrl: result.receiptUrl
      }
    });
    return res.status(201).json({ payment, verification: result });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:reference', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reference = req.params.reference;
    const result = await verifyMobileMoneyPayment(reference);
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (payment) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: result.status } });
    }
    return res.json({ reference, status: result.status, details: result.details });
  } catch (error) {
    next(error);
  }
});

export default router;
