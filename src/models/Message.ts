import mongoose, { Schema, model } from 'mongoose';

export interface IMessage {
  author: mongoose.Types.ObjectId;
  content: string;
}

const messageSchema = new Schema<IMessage>(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message body must be provided.'],
      maxlength: [10000, 'Message body is too large.'],
    },
  },
  { timestamps: true }
);

const MessageModel = model('Message', messageSchema);

export default MessageModel;
