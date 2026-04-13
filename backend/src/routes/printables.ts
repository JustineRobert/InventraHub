import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const printableSchema = z.object({
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  recordType: z.enum(['INVOICE', 'RECEIPT', 'DELIVERY_NOTE', 'LABEL']).default('INVOICE'),
  title: z.string().min(1),
  content: z.string().min(1),
  format: z.enum(['PDF', 'HTML', 'TEXT']).default('PDF')
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId } : {};
    const records = await prisma.printableRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(records);
  } catch (err) {
    next(err);
  }
});

router.post('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const payload = printableSchema.parse(req.body);
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }

    if (!payload.orderId && !payload.paymentId) {
      return res.status(400).json({ error: 'Either orderId or paymentId is required' });
    }

    const record = await prisma.printableRecord.create({
      data: {
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        businessId,
        createdById: req.user.id,
        recordType: payload.recordType,
        title: payload.title,
        content: payload.content,
        format: payload.format
      }
    });

    return res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/printed', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const record = await prisma.printableRecord.findUnique({ where: { id: req.params.id } });
    if (!record) return res.status(404).json({ error: 'Printable record not found' });
    if (req.user?.businessId && record.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.printableRecord.update({
      where: { id: req.params.id },
      data: { printedAt: new Date() }
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
