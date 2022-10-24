import { Schema, model, Types } from 'mongoose';

interface IMessage {
  author: Types.ObjectId | undefined;
  content: string;
  file: string;
}

const messageSchema = new Schema<IMessage>(
  {
    author: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      maxlength: [10000, 'Message body is too large.'],
      default: '',
    },
    file: { type: String },
  },
  { timestamps: true }
);

const MessageModel = model('Message', messageSchema);

export default MessageModel;
