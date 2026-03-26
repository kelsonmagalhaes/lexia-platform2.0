import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';
import * as quizService from './quiz.service';
import { startQuizSchema, submitQuizSchema } from './quiz.schema';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.post('/start', validateBody(startQuizSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await quizService.startQuiz(req.userId!, req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/submit', validateBody(submitQuizSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { attemptId, answers } = req.body;
    const data = await quizService.submitQuiz(req.userId!, attemptId, answers);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
