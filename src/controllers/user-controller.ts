import AppError from '../error/base-error';
import UserModel from '../models/User';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { Request as IReq, Response as IRes } from 'express';
import path from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { UserData } from '../@types/interfaces';
import { existsSync } from 'fs';

export default class UserController {
  async getUser(req: IReq, res: IRes): Promise<IRes<any, Record<string, any>>> {
    const userId = req.body.user;
    const foundUser = await UserModel.findOne({ _id: userId })
      .select('-password -recovery_key')
      .lean();

    if (!foundUser) throw new AppError('User not found.', 404);

    const { picture, ...data } = foundUser;

    if (existsSync(picture.filePath)) {
      if (picture.filePath) {
        const avatarFileData = await readFile(picture.filePath, {
          encoding: 'base64',
        });
        const avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
        return res.status(200).json({ user: { ...data, avatar } });
      }
    }
    return res.status(200).json({ user: { ...data, avatar: '' } });
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

  async updateUser(
    req: IReq,
    res: IRes
  ): Promise<IRes<any, Record<string, any>>> {
    var { password, user: userId, avatar, ...data } = req.body;
    // check if user exists
    const isUser = await UserModel.exists({ _id: userId }).lean();
    if (!isUser) throw new AppError('User not found', 404);

    if (avatar) {
      const fileData = avatar.split(';base64,').pop();
      const fileExtension = avatar.split(';base64,')[0].split('/')[1];
      const ramdom_id = uuidV4();
      const storePath = '/uploads/users/images';
      const fileWithPath = path.join(
        __dirname,
        '..',
        `${storePath}/${ramdom_id}.${fileExtension}`
      );

      if (!existsSync(path.join(__dirname, '..', storePath))) {
        await mkdir(path.join(__dirname, '..', storePath), {
          recursive: true,
        });
      }
      await writeFile(fileWithPath, fileData, { encoding: 'base64' });
      data.picture = {
        id: ramdom_id,
        extension: fileExtension,
        filePath: fileWithPath,
      };
    }

    if (password) {
      if (String(password).length < 6)
        throw new AppError('Password must have at least 6 characters', 400);
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const updatedUserData: UserData = await UserModel.findOneAndUpdate(
      { _id: userId },
      { ...data },
      { runValidators: true, new: true }
    )
      .select('-password -recovery_key')
      .lean();

    const { picture, ...updatedData } = updatedUserData;
    if (existsSync(picture.filePath)) {
      if (picture.filePath) {
        const avatarFileData = await readFile(picture.filePath, {
          encoding: 'base64',
        });
        const avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
        return res.status(200).json({ user: { ...updatedData, avatar } });
      }
    }
    return res.status(200).json({ user: { ...updatedData, avatar: '' } });
  }

  async deleteUser(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    await UserModel.deleteOne({ _id: userId }).lean();
    res.sendStatus(200);
  }
}
