import asyncWrapper from '../utils/async-wrapper';
import { Router } from 'express';
import MessegesController from '../controllers/messages-controller';

const router = Router();
const controller = new MessegesController();

router
  .route('/')
  .get(asyncWrapper(controller.getAllMessages))
  .delete(asyncWrapper(controller.deleteAllMessages));

router
  .route('/:id')
  .get(asyncWrapper(controller.getMessage))
  .delete(asyncWrapper(controller.deleteMessage));

export { router as messageRoutes };
