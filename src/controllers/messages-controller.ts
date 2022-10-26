import MessageModel from '../models/Message';
import AppError from '../error/base-error';
import { Response as IRes, Request as IReq } from 'express';
export default class MessegesController {
  async getAllMessages(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const messages = await MessageModel.find({ author: userId }).lean();
    res.status(200).json({ messages });
  }

  async getMessage(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const messageId = req.params.id;
    const message = await MessageModel.findOne({
      author: userId,
      _id: messageId,
    }).lean();
    if (!message) throw new AppError('Message not found', 404);
    res.status(200).json({ message });
  }

  async createMessage(data: any): Promise<void> {
    try {
      await MessageModel.create({ ...data });
    } catch (err) {
      console.error(err);
    }
  }

  async deleteMessage(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    const messageId = req.params.id;
    await MessageModel.deleteOne({ _id: messageId, author: userId }).lean();
    res.sendStatus(204);
  }

  async deleteAllMessages(req: IReq, res: IRes): Promise<void> {
    const userId = req.body.user;
    await MessageModel.deleteMany({ author: userId }).lean();
    res.sendStatus(204);
  }
}
