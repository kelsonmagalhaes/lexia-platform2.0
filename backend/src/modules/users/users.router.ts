import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as usersController from './users.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);
router.delete('/me', usersController.deleteMe);
router.get('/me/export', usersController.exportMyData);

export default router;
