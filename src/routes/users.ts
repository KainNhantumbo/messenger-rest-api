import UserController from '../controllers/user-controller';
import { Router } from 'express';
import asyncWrapper from '../utils/async-wrapper';
import authenticate from '../middlewares/auth-middleware';

const router = Router();
const controller = new UserController();

router
  .route('/')
  .get(authenticate, asyncWrapper(controller.getAllUsers))
  .post(asyncWrapper(controller.createUser))
  .patch(authenticate, asyncWrapper(controller.updateUser))
  .delete(authenticate, asyncWrapper(controller.deleteUser));

router.route('/:id').get(authenticate, asyncWrapper(controller.getUser));

export { router as userRoutes };
