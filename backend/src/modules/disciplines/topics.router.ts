import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as disciplinesController from './disciplines.controller';

const router = Router();
router.use(requireAuth);
router.get('/:disciplineId', disciplinesController.getTopicsByDiscipline);
export default router;
