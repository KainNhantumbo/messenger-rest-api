import { Schema, model } from 'mongoose';

interface IMessage {
  author: Schema.Types.ObjectId;
  content: string;
  chatId: string;
  file: string;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
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
