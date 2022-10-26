import AppError from '../error/base-error';
import UserModel from '../models/User';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { Request as IReq, Response as IRes } from 'express';

export default class UserController {
  async getUser(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const user = await UserModel.findOne({ _id: userId })
      .select('-password -recovery_key')
      .lean();

    if (!user) throw new AppError('User not found.', 404);
    res.status(200).json({ user });
  }

  async getAllUsers(req: IReq, res: IRes): Promise<void> {
    const users = await UserModel.find({})
      .select('-password -recovery_key')
      .lean();
    res.status(200).json({ users });
  }

  async createUser(req: IReq, res: IRes): Promise<void> {
    const { password, email, ...data } = req.body;
    if (!password || String(password).length < 6)
      throw new AppError('Password must have at least 6 characters', 400);
    if (!email) throw new AppError('Please provide your e-mail adress', 400);

    // check for duplicates
    const existingUser = await UserModel.exists({ email }).lean();
    if (existingUser)
      throw new AppError('Account with provided e-mail already exists', 409);

    const ramdomId: Array<string> = uuidV4().toUpperCase().split('-');
    const recovery_key: string = `${ramdomId[0]}-${ramdomId[2]}-${
      ramdomId[ramdomId.length - 1]
    }`;

    await UserModel.create({
      password,
      email,
      recovery_key,
      ...data,
    });
    res.status(201).json({ userKey: recovery_key });
  }

  async updateUser(req: IReq, res: IRes): Promise<void> {
    var { password, user: userId, ...data } = req.body;
    // check if user exists
    const isUser = await UserModel.exists({ _id: userId }).lean();
    if (!isUser) throw new AppError('User not found', 404);

    if (password) {
      if (String(password).length < 6)
        throw new AppError('Password must have at least 6 characters', 400);

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      await UserModel.updateOne(
        { _id: userId },
        { ...data, password },
        { runValidators: true }
      ).lean();
    } else {
      await UserModel.updateOne(
        { _id: userId },
        { ...data },
        { runValidators: true }
      ).lean();
    }
    res.sendStatus(200);
  }

  async deleteUser(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    await UserModel.deleteOne({ _id: userId }).lean();
    res.sendStatus(200);
  }
}
