import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as usersController from './users.controller';
import { updateMeSchema } from './users.schema';

const router = Router();

router.use(requireAuth);

router.get('/me', usersController.getMe);
router.put('/me', validateBody(updateMeSchema), usersController.updateMe);
router.delete('/me', usersController.deleteMe);
router.get('/me/export', usersController.exportMyData);

export default router;
