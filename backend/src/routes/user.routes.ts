import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

router.get('/:username', userController.getPublicProfile);

export default router;
