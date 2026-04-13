import { Router } from 'express';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/sales', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user?.businessId;
    const sales = await prisma.order.groupBy({
      by: ['status'],
      where: businessId ? { businessId } : {},
      _sum: { total: true },
      _count: { id: true }
    });
    return res.json({ summary: sales });
  } catch (err) {
    next(err);
  }
});

router.get('/inventory', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user?.businessId;
    const valuation = await prisma.inventoryItem.aggregate({
      where: businessId ? { businessId } : {},
      _sum: { purchaseCost: true },
      _count: { id: true }
    });
    return res.json({ valuation });
  } catch (err) {
    next(err);
  }
});

router.get('/profit', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user?.businessId;
    const orders = await prisma.order.findMany({ where: businessId ? { businessId } : {} });
    const profit = orders.reduce((total, order) => total + (order.total - order.subtotal), 0);
    return res.json({ profit, orderCount: orders.length });
  } catch (err) {
    next(err);
  }
});

export default router;
