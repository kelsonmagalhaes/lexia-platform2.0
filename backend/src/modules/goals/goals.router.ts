import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';
import * as goalsService from './goals.service';
import { createGoalSchema, updateGoalSchema } from './goals.schema';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await goalsService.getGoals(req.userId!) });
  } catch (error) { next(error); }
});

router.post('/', validateBody(createGoalSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: await goalsService.createGoal(req.userId!, req.body) });
  } catch (error) { next(error); }
});

router.put('/:id', validateBody(updateGoalSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await goalsService.updateGoal(req.userId!, req.params.id, req.body) });
  } catch (error) { next(error); }
});

export default router;
