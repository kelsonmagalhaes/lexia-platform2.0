import { Router } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import * as pdfService from './pdf.service';
import { Response, NextFunction } from 'express';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas PDFs são aceitos') as unknown as null, false);
  },
});

const router = Router();
router.use(requireAuth);

router.post('/upload', upload.single('pdf'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Nenhum arquivo enviado' }); return; }
    const data = await pdfService.uploadAndProcessPdf(req.userId!, req.file, req.body.disciplineId);
    res.status(202).json({ data, message: 'PDF enviado. Processando...' });
  } catch (error) { next(error); }
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await pdfService.getMyPdfs(req.userId!) }); }
  catch (error) { next(error); }
});

router.get('/:id/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await pdfService.getPdfSummary(req.userId!, req.params.id) }); }
  catch (error) { next(error); }
});

router.get('/:id/quiz', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await pdfService.getPdfQuiz(req.userId!, req.params.id) }); }
  catch (error) { next(error); }
});

export default router;