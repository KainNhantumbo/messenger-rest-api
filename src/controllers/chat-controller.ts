import User from '../models/User';
import { existsSync } from 'node:fs';
import Message from '../models/Message';
import AppError from '../error/base-error';
import { readFile } from 'node:fs/promises';
import Chat, { TChat } from '../models/Chat';
import { Document, Types } from 'mongoose';
import { Response as IRes, Request as IReq } from 'express';

type TDerivedChat = any

export default class ChatController {
  async getChat(req: IReq, res: IRes): Promise<void> {
    const chatId = req.params.id;
    const userId = req.body.user;
    if (!chatId) throw new AppError('Chat ID must be provided.', 400);
    const foundChat = await Chat.findOne({ _id: chatId }).lean();

    if (!foundChat) throw new AppError('Chat not found', 404);
    const messages = await Message.find({ chatId }).lean();

    const [friendId] = [foundChat.author, foundChat.friend].filter(
      (id) => id != userId
    );

    const foundUser = await User.findOne({ _id: friendId })
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
      res.status(200).json({ ...foundChat, messages, friend: data });
      return;
    }
    res
      .status(200)
      .json({ ...data, messages, friend: { ...data, avatar: '' } });
  }

  async getAllChats(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const foundChats = await Chat.find({
      $or: [{ author: userId }, { friend: userId }],
    }).lean();

    if (foundChats.length === 0) {
      res.status(200).json([]);
    } else {
      const transformChats = async (chat: TDerivedChat) => {
        const [friendId] = [chat.author, chat.friend].filter(
          (id) => id != userId
        );
        const foundMessage = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 'desc' })
          .lean();

        const foundUser = await User.findOne({ _id: friendId })
          .select('user_name picture')
          .lean();

        if (!foundUser) {
          res.status(200).json({
            _id: chat._id,
            user_name: '[ DELETED ACCOUNT ]',
            message: foundMessage,
            avatar: '',
            createdAt: (chat as any).createdAt,
          });
        } else {
          const { picture } = foundUser;
          let data = {
            _id: chat._id,
            user_name: foundUser.user_name,
            message: foundMessage,
            avatar: '',
            createdAt: (chat as any).createdAt,
          };

          if (picture.filePath && existsSync(picture.filePath)) {
            const avatarFileData = await readFile(picture.filePath, {
              encoding: 'base64',
            });
            data.avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
            return data;
          }
          return data;
        }
        const data: any[] = [];
        await Promise.allSettled(foundChats.map(transformChats)).then(
          (result: PromiseSettledResult<any>[]) => {
            result.forEach((element) => {
              data.push((element as any).value);
            });
          }
        );
        res.status(200).json(data);
      };
    }
  }

  async createChat(req: IReq, res: IRes): Promise<void> {
    const { sender: senderId, receiver: receiverId } = req.body;
    const foundChat = await Chat.findOne({
      $or: [
        { author: senderId, friend: receiverId },
        { author: receiverId, friend: senderId },
      ],
    }).lean();

    if (foundChat) {
      const messages = await Message.find({ chatId: foundChat._id });
      res.status(200).json({ ...foundChat, messages });
    } else {
      const createdChat = await Chat.create({
        author: senderId,
        friend: receiverId,
      });
      res.status(201).json({ ...createdChat });
    }
  }

  async deleteChat(req: IReq, res: IRes): Promise<void> {
    const chatId = req.params.id;
    const deletedChat = await Chat.findOneAndDelete({ _id: chatId });
    if (deletedChat) {
      await Message.deleteMany({ chatId: deletedChat._id });
    }
    res.sendStatus(204);
  }
}
