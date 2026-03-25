import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as questionsController from './questions.controller';

const router = Router();
router.use(requireAuth);
router.get('/random', questionsController.getRandom);
router.get('/:sourceId', questionsController.getBySource);
export default router;
