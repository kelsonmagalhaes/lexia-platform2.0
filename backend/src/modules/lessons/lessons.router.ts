import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as lessonsController from './lessons.controller';

const router = Router();
router.use(requireAuth);
router.get('/:topicId', lessonsController.getLessonsByTopic);
router.get('/single/:id', lessonsController.getLessonById);
export default router;
