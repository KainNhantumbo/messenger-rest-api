import ChatModel from '../models/Chat';
import AppError from '../error/base-error';
import { Response as IRes, Request as IReq } from 'express';

export default class ChatController {
  async getChat(req: IReq, res: IRes) {
    const userId = req.body.User;
    const chatId = req.params.id;
    const foundChat = await ChatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    });
    if (!foundChat) throw new AppError('Chat not found', 404);
    res.status(200).json({ foundChat });
  }

  async getAllChats(req: IReq, res: IRes) {
    const userId = req.body.user;
    const chats = await ChatModel.find({ members: { $in: [userId] } });
    res.status(200).json({ chats });
  }

  async createChat(req: IReq, res: IRes) {
    const { senderId, receiverId } = req.body;
    const createdChat = await ChatModel.create({
      members: [receiverId, senderId],
    });
    res.status(201).json({ createdChat });
  }
}
