import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import * as statsService from './stats.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await statsService.getMyStats(req.userId!) }); }
  catch (error) { next(error); }
});

router.get('/export-pdf', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pdfBuffer = await statsService.exportStatsPdf(req.userId!);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="desempenho_lexstudy.pdf"');
    res.send(pdfBuffer);
  } catch (error) { next(error); }
});

export default router;