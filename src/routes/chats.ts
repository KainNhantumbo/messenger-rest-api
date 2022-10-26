import asyncWrapper from '../utils/async-wrapper';
import { Router } from 'express';
import ChatController from '../controllers/chat-controller';

const router = Router();
const controller = new ChatController();

router
  .route('/')
  .get(asyncWrapper(controller.getAllChats))
  .post(asyncWrapper(controller.createChat));

router.route('/:id').get(asyncWrapper(controller.getChat));

export { router as chatRoutes };
