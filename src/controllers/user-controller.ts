import path from 'node:path';
import * as bcrypt from 'bcrypt';
import User from '../models/User';
import { randomUUID } from 'node:crypto';
import AppError from '../error/base-error';
import { existsSync, readFileSync } from 'node:fs';
import { Request as IReq, Response as IRes } from 'express';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

export default class UserController {
  async getUser(req: IReq, res: IRes): Promise<IRes<any, Record<string, any>>> {
    const userId = req.body.user;
    const foundUser = await User.findOne({ _id: userId })
      .select('-password -recovery_key')
      .populate('friends')
      .lean();

    if (!foundUser) throw new AppError('User not found.', 404);

    const { picture, ...data } = foundUser;
    if (picture?.filePath && existsSync(picture?.filePath)) {
      const avatarFileData = await readFile(picture.filePath, {
        encoding: 'base64',
      });
      const avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
      return res.status(200).json({ ...data, avatar });
    }
    return res.status(200).json({ ...data, avatar: '' });
  }

  async getAllUsers(req: IReq, res: IRes): Promise<void> {
    const { sort, search, fields, offset, limit } = req.query;
    const { user: userId } = req.body;
    const queryParams: any = {};

    if (search) {
      queryParams['$or'] = [
        { user_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
      ];
    }

    let queryResult = User.find(queryParams);
    if (fields) {
      let fieldsString = String(fields);
      if (fieldsString.includes('avatar')) {
        fieldsString = fieldsString.replace('avatar', 'picture');
      }
      const formatedFields = fieldsString.split(',').join(' ');
      queryResult = queryResult.select(formatedFields);
    } else {
      queryResult = queryResult.select('-password -recovery_key');
    }

    if (sort) {
      const sortValue: string = String(sort);
      queryResult = queryResult.sort(sortValue);
    } else {
      queryResult = queryResult.sort('user_name');
    }

    if (limit && offset) {
      queryResult.skip(Number(offset)).limit(Number(limit));
    }

    const foundUsers = (await queryResult.lean()).filter(
      (user) => user._id != userId
    );
    const users = foundUsers.map((user) => {
      const { picture, ...data } = user;
      if (picture && existsSync(picture.filePath)) {
        const avatarFileData = readFileSync(picture.filePath, {
          encoding: 'base64',
        });
        const avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
        return { ...data, avatar };
      }
      return { ...data, avatar: '' };
    });
    res.status(200).json({ users });
  }

  async createUser(req: IReq, res: IRes): Promise<void> {
    const { password, email, ...data } = req.body;
    if (!password || String(password).length < 6)
      throw new AppError('Password must have at least 6 characters', 400);
    if (!email) throw new AppError('Please provide your e-mail adress', 400);

    // check for duplicates
    const existingUser = await User.exists({ email }).lean();
    if (existingUser)
      throw new AppError('Account with provided e-mail already exists', 409);

    const ramdomId: string[] = randomUUID().toUpperCase().split('-');
    const recovery_key: string = `${ramdomId[0]}-${ramdomId[2]}-${
      ramdomId[ramdomId.length - 1]
    }`;
    await User.create({ password, email, recovery_key, ...data });
    res.status(201).json({ code: recovery_key });
  }

  async updateUser(req: IReq, res: IRes): Promise<void> {
    var { password, user: userId, avatar, friend, ...data } = req.body;
    const isUser = await User.findOne({ _id: userId }).lean();
    if (!isUser) throw new AppError('User not found', 404);

    if (avatar) {
      const fileData = avatar.split(';base64,').pop();
      const fileExtension = avatar.split(';base64,')[0].split('/')[1];
      const ramdom_id = randomUUID();
      const storePath = '/uploads/users/images';
      const fileWithPath = path.join(
        __dirname,
        '..',
        `${storePath}/${ramdom_id}.${fileExtension}`
      );
      const { picture } = isUser;
      if (picture.filePath && existsSync(picture.filePath)) {
        await rm(picture.filePath);
      }
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

    const updatedUserData = await User.findOneAndUpdate(
      { _id: userId },
      { ...data },
      { runValidators: true, new: true }
    )
      .select('-password -recovery_key')
      .lean();

    if (!updatedUserData) throw new AppError('Update operation failed', 400);
    const { picture, ...updatedData } = updatedUserData;
    const user_data = { ...updatedData, avatar: '' };
    if (picture?.filePath && existsSync(picture?.filePath)) {
      const avatarFileData = await readFile(picture.filePath, {
        encoding: 'base64',
      });
      user_data.avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
    }
    res.status(200).json({ ...user_data });
  }

  async deleteUser(req: IReq, res: IRes): Promise<void> {
    const { user: userId, password } = req.body;
    if (!password) throw new AppError('Please provide your password.', 400);

    if (String(password).length < 6)
      throw new AppError('Invalid password.', 400);

    const foundUser = await User.findOne({ _id: userId });
    if (!foundUser) throw new AppError('Account not found.', 404);

    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) throw new AppError('Wrong password, try again. ', 403);

    const deletedUser = await User.findOneAndDelete({
      _id: userId,
    });
    if (!deletedUser) throw new AppError('Unable to process your request', 202);
    // remove user profile picture from  disk
    const { picture } = deletedUser;
    if (picture.filePath && existsSync(picture.filePath))
      await rm(picture.filePath);
    res.sendStatus(200);
  }
}
