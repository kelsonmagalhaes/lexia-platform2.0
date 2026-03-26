import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { lexIaLimiter } from '../../middleware/rateLimiter';
import { validateBody } from '../../middleware/validate';
import * as lexIaService from './lex-ia.service';
import {
  chatSchema,
  explainSchema,
  generateQuizSchema,
  correctEssaySchema,
  simulateExamSchema,
  ChatInput,
  ExplainInput,
} from './lex-ia.schema';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth, lexIaLimiter);

router.post('/chat', validateBody(chatSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body as ChatInput;
    res.json({ data: await lexIaService.chat(req.userId!, message, history) });
  } catch (error) { next(error); }
});

router.post('/explain', validateBody(explainSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, disciplineName } = req.body as ExplainInput;
    res.json({ data: await lexIaService.explainContent(req.userId!, content, disciplineName) });
  } catch (error) { next(error); }
});

router.post('/generate-quiz', validateBody(generateQuizSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.generateQuiz(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

router.post('/correct-essay', validateBody(correctEssaySchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.correctEssay(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

router.post('/simulate-exam', validateBody(simulateExamSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.simulateExam(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

export default router;