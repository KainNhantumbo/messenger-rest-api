import asyncWrapper from '../utils/async-wrapper';
import { Router } from 'express';
import MessegesController from '../controllers/messages-controller';
import authenticate from '../middlewares/auth-middleware';

const router = Router();
const controller = new MessegesController();

router
  .route('/')
  .get(authenticate, asyncWrapper(controller.getAllMessages))
  .post(authenticate, asyncWrapper(controller.createMessage))
  .delete(authenticate, asyncWrapper(controller.deleteAllMessages));

router
  .route('/:id')
  .get(authenticate, asyncWrapper(controller.getMessage))
  .delete(authenticate, asyncWrapper(controller.deleteMessage));

export { router as messageRoutes };
