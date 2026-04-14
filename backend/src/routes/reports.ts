import { Router } from 'express';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';
import { getCachedBusinessAnalytics, computeBusinessAnalytics } from '../services/analytics';

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

router.get('/analytics', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }
    const cachedAnalytics = getCachedBusinessAnalytics(businessId);
    if (cachedAnalytics) {
      return res.json(cachedAnalytics);
    }
    const analytics = await computeBusinessAnalytics(businessId);
    return res.json(analytics);
  } catch (err) {
    next(err);
  }
});

router.get('/export/:format', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const { format } = req.params;
    const businessId = req.user?.businessId;
    const orders = await prisma.order.findMany({ where: businessId ? { businessId } : {} });
    const data = orders.map((order) => ({
      reference: order.reference,
      status: order.status,
      total: order.total,
      currency: order.currency || 'USD',
      createdAt: order.createdAt,
      branchId: order.branchId || 'N/A'
    }));

    if (format === 'csv') {
      const header = 'reference,status,total,currency,createdAt,branchId';
      const rows = data.map((row) => [row.reference, row.status, row.total, row.currency, row.createdAt.toISOString(), row.branchId].join(','));
      res.header('Content-Type', 'text/csv');
      res.attachment('sales-export.csv');
      return res.send([header, ...rows].join('\n'));
    }

    if (format === 'json') {
      res.header('Content-Type', 'application/json');
      return res.json({ orders: data });
    }

    res.status(400).json({ message: 'Unsupported export format' });
  } catch (err) {
    next(err);
  }
});

export default router;
