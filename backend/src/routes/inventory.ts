import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, roleGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const itemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  serialNumber: z.string().optional(),
  description: z.string().optional(),
  purchaseCost: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  quantity: z.number().int().nonnegative().default(0),
  threshold: z.number().int().nonnegative().default(5),
  categoryId: z.string(),
  branchId: z.string().optional(),
  businessId: z.string()
});

router.post('/', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const payload = itemSchema.parse(req.body);
    const item = await prisma.inventoryItem.create({ data: payload });
    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId } : {};
    const items = await prisma.inventoryItem.findMany({
      where,
      include: { category: true, branch: true }
    });
    return res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId, quantity: { lt: 5 } } : { quantity: { lt: 5 } };
    const items = await prisma.inventoryItem.findMany({ where, include: { category: true, branch: true } });
    return res.json(items);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const payload = itemSchema.partial().parse(req.body);
    const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data: payload });
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authGuard, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
