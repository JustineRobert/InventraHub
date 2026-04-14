import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, roleGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const branchSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  businessId: z.string().optional()
});

router.post('/', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const payload = branchSchema.parse(req.body);
    const businessId = req.user?.businessId || payload.businessId;
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }
    if (req.user?.businessId && businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Business mismatch' });
    }
    const branch = await prisma.branch.create({ data: { name: payload.name, address: payload.address, businessId } });
    return res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
});

router.get('/', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user?.businessId ? { businessId: req.user.businessId } : {};
    const branches = await prisma.branch.findMany({ where });
    return res.json(branches);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const payload = branchSchema.partial().parse(req.body);
    const existing = await prisma.branch.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Branch not found' });
    if (req.user?.businessId && existing.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const branch = await prisma.branch.update({ where: { id: req.params.id }, data: payload });
    return res.json(branch);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authGuard, roleGuard(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.branch.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Branch not found' });
    if (req.user?.businessId && existing.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.branch.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
