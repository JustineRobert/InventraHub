import { Router } from 'express';
import { authGuard, AuthRequest } from '../middleware/auth';
import { getDemandForecast } from '../services/forecast';

const router = Router();

router.get('/demand', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }
    const forecast = await getDemandForecast(businessId);
    return res.json(forecast);
  } catch (err) {
    next(err);
  }
});

export default router;
