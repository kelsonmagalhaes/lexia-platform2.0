import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AuthRequest } from '../../middleware/auth';
import * as gamificationService from './gamification.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await gamificationService.getMyGamification(req.userId!);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/xp', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventType, reason } = req.body;
    const data = await gamificationService.awardXp(req.userId!, eventType, reason);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
