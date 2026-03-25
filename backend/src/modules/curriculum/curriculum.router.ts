import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as curriculumController from './curriculum.controller';

const router = Router();
router.use(requireAuth);
router.get('/', curriculumController.getCurriculum);
router.get('/:period', curriculumController.getPeriod);
export default router;
