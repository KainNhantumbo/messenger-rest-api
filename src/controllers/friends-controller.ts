import Friend from '../models/Friend';
import AppError from '../error/base-error';
import { Request as IReq, Response as IRes } from 'express';

export default class FriendsController {
  async getFriend(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const { id: friendId } = req.params;
    const foundFriend = await Friend.findOne({
      _id: friendId,
      user: userId,
    }).lean();
    if (!foundFriend) throw new AppError('Friend not found.', 404);
    res.status(200).json({ foundFriend });
  }

  async getAllFriends(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const foundFriends = await Friend.find({ user: userId }).lean();
    res.status(200).json({ foundFriends });
  }

  async createFriend(req: IReq, res: IRes): Promise<void> {
    const { friend, user: userId } = req.body;
    await Friend.create({ user: userId, ...friend });
    res.sendStatus(201);
  }

  async deleteFriend(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const { id: friendId } = req.params;
    await Friend.deleteOne({ user: userId, _id: friendId }).lean();
    res.sendStatus(204);
  }
}
