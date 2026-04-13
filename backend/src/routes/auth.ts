import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES']).optional(),
  businessId: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const hashed = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashed,
        name: payload.name,
        role: payload.role || 'SALES',
        businessId: payload.businessId
      }
    });
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(payload.password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '8h'
    });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, businessId: user.businessId } });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role, business: user.business });
  } catch (err) {
    next(err);
  }
});

router.post('/otp-verify', async (req, res) => {
  return res.json({ message: 'OTP verification is stubbed in scaffold. Replace with SMS provider integration.' });
});

router.post('/reset-password', async (req, res) => {
  return res.json({ message: 'Password reset is scaffolded. Implement secure email/SMS reset flow for production.' });
});

export default router;
