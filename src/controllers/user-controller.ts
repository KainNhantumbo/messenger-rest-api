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

  async createUser(req: IReq, res: IRes) {
    const { password, email, ...data } = req.body;
    if (!password || password.length < 6)
      throw new AppError('Password must have at least 6 characters', 400);
    if (!email) throw new AppError('Please provide your e-mail adress', 400);

    // check for duplicates
    const existingUser = await UserModel.exists({ email }).lean();
    if (existingUser)
      throw new AppError('Account with provided e-mail already exists', 409);

    const createdUser = await UserModel.create({ password, email, ...data });
    res.status(201).json({ userKey: createdUser.recovery_key });
  }
}
