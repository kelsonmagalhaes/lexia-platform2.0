import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { lexIaLimiter } from '../../middleware/rateLimiter';
import * as lexIaService from './lex-ia.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth, lexIaLimiter);

router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;
    if (!message) { res.status(400).json({ error: 'Mensagem é obrigatória' }); return; }
    res.json({ data: await lexIaService.chat(req.userId!, message, history) });
  } catch (error) { next(error); }
});

router.post('/explain', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, disciplineName } = req.body;
    if (!content) { res.status(400).json({ error: 'Conteúdo é obrigatório' }); return; }
    res.json({ data: await lexIaService.explainContent(req.userId!, content, disciplineName) });
  } catch (error) { next(error); }
});

router.post('/generate-quiz', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.generateQuiz(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

router.post('/correct-essay', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.correctEssay(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

router.post('/simulate-exam', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await lexIaService.simulateExam(req.userId!, req.body) }); }
  catch (error) { next(error); }
});

export default router;