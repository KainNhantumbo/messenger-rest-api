import { Router } from 'express';
import asyncWrapper from '../utils/async-wrapper';
import FriendsController from '../controllers/friends-controller';
import authenticate from '../middlewares/auth-middleware';

const router = Router();
const controller = new FriendsController();

router
  .route('/')
  .get(authenticate, asyncWrapper(controller.getAllFriends))
  .post(authenticate, asyncWrapper(controller.createFriend));

router
  .route('/:id')
  .get(authenticate, asyncWrapper(controller.getFriend))
  .delete(authenticate, asyncWrapper(controller.deleteFriend));

export { router as friendRoutes };
