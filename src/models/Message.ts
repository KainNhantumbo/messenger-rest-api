import { Schema, model } from 'mongoose';

interface IMessage {
  author: Schema.Types.ObjectId;
  chatId: Schema.Types.ObjectId;
  content: string;
  file: { id: string; extension: string; filePath: string };
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
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
    file: {
      id: {
        type: String,
        default: '',
      },
      extension: {
        type: String,
        default: '',
      },
      filePath: {
        type: String,
        default: '',
      },
    },
  },
  { timestamps: true }
);

const MessageModel = model('Message', messageSchema);
export default MessageModel;
