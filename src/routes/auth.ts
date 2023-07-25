import { Router } from 'express';
import authController from '../controllers/auth-controller';
import asyncWrapper from '../utils/async-wrapper';

const router = Router();
const controller = new authController();

router.get('/refresh', asyncWrapper(controller.refresh));
router.post('/login', asyncWrapper(controller.login));
router.post('/logout', controller.logout);

export { router as authRoutes };
