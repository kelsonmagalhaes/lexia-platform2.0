import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AuthRequest } from '../../middleware/auth';
import * as institutionsService from './institutions.service';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query as Record<string, string>;
    const data = await institutionsService.searchInstitutions(q || '');
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/custom', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Nome é obrigatório' }); return; }
    const data = await institutionsService.createCustomInstitution(name, req.userId!);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
