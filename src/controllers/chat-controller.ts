import ChatModel from '../models/Chat';
import AppError from '../error/base-error';
import { Response as IRes, Request as IReq } from 'express';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import UserModel from '../models/User';
import MessageModel from '../models/Message';

export default class ChatController {
  async getChat(req: IReq, res: IRes) {
    const chatId = req.params.id;
    const userId = req.body.user;
    if (!chatId) throw new AppError('Chat ID must be provided.', 400);
    const foundChat = await ChatModel.findOne({ _id: chatId }).lean();

    if (!foundChat) throw new AppError('Chat not found', 404);
    const messages = await MessageModel.find({ chatId: foundChat._id });
    const [friendId] = [foundChat.author, foundChat.friend].filter(
      (id) => id != userId
    );

    const foundUser = await UserModel.findOne({ _id: friendId })
      .select('user_name email picture')
      .lean();
    if (!foundUser) throw new AppError('User not found.', 404);
    let { picture, ...data } = foundUser;
    if (picture?.filePath && existsSync(picture?.filePath)) {
      const avatarFileData = await readFile(picture.filePath, {
        encoding: 'base64',
      });
      (data as any) = {
        ...data,
        avatar: `data:image/${picture.extension};base64,${avatarFileData}`,
      };
      return res.status(200).json({ ...foundChat, messages, friend: data });
    }
    return res.status(200).json({ ...data, messages, avatar: '' });
  }

  async getAllChats(req: IReq, res: IRes) {
    const userId = req.body.user;
    const foundChats = await ChatModel.find({
      $or: [{ author: userId }, { friend: userId }],
    }).lean();

    if (foundChats.length === 0) return res.status(200).json(foundChats);

    const transformChats = async (chat: any) => {
      const [friendId] = [chat.author, chat.friend].filter(
        (id) => id != userId
      );
      const message = (await MessageModel.find({ chatId: chat._id }).lean())
        .sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1))
        .pop();
      const foundUser = await UserModel.findOne({ _id: friendId })
        .select('user_name picture')
        .lean();
      if (!foundUser) throw new AppError('User not found.', 404);
      const { picture } = foundUser;
      if (picture?.filePath && existsSync(picture?.filePath)) {
        const avatarFileData = await readFile(picture.filePath, {
          encoding: 'base64',
        });

        return {
          _id: chat._id,
          user_name: foundUser.user_name,
          message,
          avatar: `data:image/${picture.extension};base64,${avatarFileData}`,
          createdAt: (chat as any).createdAt,
        };
      }
      return {
        _id: chat._id,
        user_name: foundUser.user_name,
        message,
        avatar: '',
        createdAt: (chat as any).createdAt,
      };
    };
    const dataArr: any = [];
    await Promise.allSettled(foundChats.map(transformChats)).then(
      (result: any) => {
        dataArr.push(result[0].value);
      }
    );

    res.status(200).json(dataArr);
  }

  async createChat(
    req: IReq,
    res: IRes
  ): Promise<IRes<any, Record<string, any>> | undefined> {
    const { sender: senderId, receiver: receiverId } = req.body;
    // check for duplicates
    const existingChat = await ChatModel.findOne({
      $or: [
        { author: senderId, friend: receiverId },
        { author: receiverId, friend: senderId },
      ],
    }).lean();

    if (existingChat !== null) {
      const messages = await MessageModel.find({ chatId: existingChat._id });
      return res.status(200).json({ ...existingChat, messages });
    }

    const createdChat = await ChatModel.create({
      author: senderId,
      friend: receiverId,
    });
    res.status(201).json({ ...createdChat });
  }

  async deleteChat(req: IReq, res: IRes): Promise<void> {
    // const chatId = req.params.id;
    // const deletedChat = await ChatModel.deleteOne({ _id: chatId })
    //   .populate('messages')
    //   .deleteMany({});
    // code
    await ChatModel.deleteMany({});
    res.sendStatus(204);
  }
}
