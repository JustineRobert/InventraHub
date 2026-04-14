import { Router } from 'express';
import { z } from 'zod';
import { authGuard, AuthRequest } from '../middleware/auth';
import { sendWhatsAppMessage } from '../services/whatsapp';

const router = Router();

const notificationSchema = z.object({
  phone: z.string().min(7),
  message: z.string().min(1),
  orderId: z.string().optional()
});

router.post('/whatsapp', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const payload = notificationSchema.parse(req.body);
    const result = await sendWhatsAppMessage(payload.phone, payload.message, payload.orderId);
    return res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

export default router;
