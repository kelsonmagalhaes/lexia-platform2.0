import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AuthRequest } from '../../middleware/auth';
import * as progressService from './progress.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { disciplineId } = req.query as Record<string, string>;
    const data = await progressService.getUserProgress(req.userId!, disciplineId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await progressService.getProgressSummary(req.userId!);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.put('/:lessonId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, score } = req.body;
    const data = await progressService.upsertProgress(req.userId!, req.params.lessonId, status, score);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
