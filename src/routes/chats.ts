import asyncWrapper from '../utils/async-wrapper';
import { Router } from 'express';
import ChatController from '../controllers/chat-controller';
import authenticate from '../middlewares/auth-middleware';

const router = Router();
const controller = new ChatController();

router
  .route('/')
  .get(authenticate, asyncWrapper(controller.getAllChats))
  .post(authenticate, asyncWrapper(controller.createChat)).delete(authenticate, asyncWrapper(controller.deleteChat))

router.route('/:id').get(authenticate, asyncWrapper(controller.getChat));


export { router as chatRoutes };
