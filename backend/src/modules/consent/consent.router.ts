import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { AuthRequest } from '../../middleware/auth';
import * as consentService from './consent.service';
import { upsertConsentSchema } from './consent.schema';
import { Response, NextFunction } from 'express';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await consentService.getConsents(req.userId!) });
  } catch (error) { next(error); }
});

router.post('/', validateBody(upsertConsentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { consentType, accepted } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const data = await consentService.upsertConsent(req.userId!, consentType, accepted, ip, userAgent);
    res.json({ data });
  } catch (error) { next(error); }
});

export default router;
