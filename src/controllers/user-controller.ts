import AppError from '../error/base-error';
import UserModel from '../models/User';
import { Request as IReq, Response as IRes } from 'express';

export default class UserController {
  async getUser(req: IReq, res: IRes) {
    const userId = req.body.user;
    const user = await UserModel.findOne({ _id: userId })
      .select('-password')
      .lean();

    if (!user) throw new AppError('User not found.', 404);
    res.status(200).json({ user });
  }

  async getAllUsers(req: IReq, res: IRes) {
    const users = await UserModel.find({}).select('-password').lean();
    res.status(200).json({ users });
  }

  async createUser (req: IReq, res: IRes) {
    const {password, ...data} = req.body
    await UserModel.create({password, ...data})
  }
}
