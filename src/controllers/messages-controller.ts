import Message from '../models/Message';
import AppError from '../error/base-error';
import { Response as IRes, Request as IReq } from 'express';

export default class MessegesController {
  async getAllMessages(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const messages = await Message.find({ author: userId })
      .select('-updatedAt')
      .sort('createdAt')
      .lean();
    res.status(200).json({ ...messages });
  }

  async getMessage(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const { id: messageId } = req.params;
    const message = await Message.findOne({
      author: userId,
      _id: messageId,
    })
      .select('-updatedAt')
      .lean();
    if (!message) throw new AppError('Message not found', 404);
    res.status(200).json({ ...message });
  }

  async createMessage(req: IReq, res: IRes): Promise<void> {
    const { user: userId, ...data } = req.body;
    await Message.create({ ...data, author: userId });
    res.sendStatus(201);
  }

  async deleteMessage(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    const { id: messageId } = req.params;
    await Message.deleteOne({ _id: messageId, author: userId }).lean();
    res.sendStatus(204);
  }

  async deleteAllMessages(req: IReq, res: IRes): Promise<void> {
    const { user: userId } = req.body;
    await Message.deleteMany({ author: userId }).lean();
    res.sendStatus(204);
  }
}
