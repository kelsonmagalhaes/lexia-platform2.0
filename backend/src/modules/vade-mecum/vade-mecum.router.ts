import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import * as vadeMecumService from './vade-mecum.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/search', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, lawCode } = req.query as Record<string, string>;
    if (!q) { res.status(400).json({ error: 'Parâmetro q é obrigatório' }); return; }
    res.json({ data: await vadeMecumService.searchArticles(q, lawCode) });
  } catch (error) { next(error); }
});

router.get('/article', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lawCode, articleNumber } = req.query as Record<string, string>;
    if (!lawCode || !articleNumber) { res.status(400).json({ error: 'lawCode e articleNumber são obrigatórios' }); return; }
    res.json({ data: await vadeMecumService.getArticle(lawCode, articleNumber) });
  } catch (error) { next(error); }
});

router.get('/favorites', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ data: await vadeMecumService.getFavorites(req.userId!) }); }
  catch (error) { next(error); }
});

router.post('/favorites', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lawCode, articleNumber, articleText } = req.body;
    res.status(201).json({ data: await vadeMecumService.addFavorite(req.userId!, lawCode, articleNumber, articleText) });
  } catch (error) { next(error); }
});

router.delete('/favorites/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await vadeMecumService.removeFavorite(req.userId!, req.params.id);
    res.json({ data: null, message: 'Removido' });
  } catch (error) { next(error); }
});

export default router;