import AppError from '../error/base-error';
import { Request as IReq, Response as IRes } from 'express';
import FriendModel from '../models/Friend';

export default class FriendsController {
  async getFriend(req: IReq, res: IRes) {
    const userId = req.body.user;
    const friendId = req.params.id;
    const foundFriend = await FriendModel.findOne({
      _id: friendId,
      belongsTo: userId,
    }).lean();
    if (!foundFriend) throw new AppError('Friend not found.', 404);
    res.status(200).json({ foundFriend });
  }
  async getAllFriends(req: IReq, res: IRes) {
    const userId = req.body.user;
    const foundFriends = await FriendModel.find({ belongsTo: userId });
    res.status(200).json({ foundFriends });
  }

  async createFriend(req: IReq, res: IRes) {}
  async deleteFriend(req: IReq, res: IRes) {}
}
