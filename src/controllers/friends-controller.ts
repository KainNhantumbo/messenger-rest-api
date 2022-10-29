import AppError from '../error/base-error';
import { Request as IReq, Response as IRes } from 'express';
import FriendModel from '../models/Friend';

export default class FriendsController {
  async getFriend(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const friendId = req.params.id;
    const foundFriend = await FriendModel.findOne({
      _id: friendId,
      user: userId,
    }).lean();
    if (!foundFriend) throw new AppError('Friend not found.', 404);
    res.status(200).json({ foundFriend });
  }

  async getAllFriends(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const foundFriends = await FriendModel.find({ user: userId }).lean();
    res.status(200).json({ foundFriends });
  }

  async createFriend(req: IReq, res: IRes): Promise<void> {
    const { friend, user: userId } = req.body;
    await FriendModel.create({
      user: userId,
      ...friend,
    });
    res.sendStatus(201);
  }

  async deleteFriend(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const friendId = req.params.id;
    await FriendModel.deleteOne({
      user: userId,
      _id: friendId,
    }).lean();
    res.sendStatus(204);
  }
}
