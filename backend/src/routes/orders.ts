import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, roleGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const orderItemSchema = z.object({
  inventoryItemId: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().nonnegative()
});

const orderSchema = z.object({
  reference: z.string().min(1),
  customer: z.object({ name: z.string().min(1), phone: z.string().min(7), email: z.string().email().optional() }),
  items: z.array(orderItemSchema).min(1),
  tax: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  currency: z.enum(['UGX', 'KES', 'TZS', 'USD']).optional(),
  branchId: z.string().optional(),
  businessId: z.string().optional()
});

router.post('/', authGuard, roleGuard(['ADMIN', 'MANAGER', 'SALES']), async (req: AuthRequest, res, next) => {
  try {
    const payload = orderSchema.parse(req.body);
    const businessId = payload.businessId || req.user?.businessId;
    if (!businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }
    if (req.user?.businessId && payload.businessId && payload.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Cannot create orders for other businesses' });
    }

    const customer = await prisma.customer.upsert({
      where: { phone: payload.customer.phone },
      update: { name: payload.customer.name, email: payload.customer.email },
      create: payload.customer
    });

    const subtotal = payload.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const total = subtotal + payload.tax - payload.discount;

    const currency = payload.currency || 'USD';

    const order = await prisma.order.create({
      data: {
        reference: payload.reference,
        customerId: customer.id,
        businessId,
        branchId: payload.branchId,
        createdById: req.user!.id,
        status: 'PENDING',
        subtotal,
        tax: payload.tax,
        discount: payload.discount,
        total,
        currency,
        items: { create: payload.items }
      },
      include: { customer: true, items: true }
    });

    await prisma.transaction.create({
      data: {
        reference: `TX-ORDER-${Date.now()}`,
        orderId: order.id,
        businessId,
        createdById: req.user!.id,
        type: 'ORDER',
        amount: total,
        currency,
        status: 'PENDING',
        metadata: { items: order.items.length }
      }
    });

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId } : {};
    const orders = await prisma.order.findMany({ where, include: { customer: true, items: true, payments: true } });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { customer: true, items: true, payments: true } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user?.businessId && order.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    return res.json(order);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const status = z.enum(['PENDING', 'PAID', 'DELIVERED', 'CANCELLED']).parse(req.body.status);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user?.businessId && order.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
