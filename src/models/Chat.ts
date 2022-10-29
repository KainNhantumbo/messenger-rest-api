import { Schema, model } from 'mongoose';

interface IChat {
  user: Schema.Types.ObjectId;
  friend: Schema.Types.ObjectId;
  messages: Schema.Types.ObjectId[];
}

const chatSchema = new Schema<IChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  { timestamps: true }
);

const ChatModel = model('Chat', chatSchema);
export default ChatModel;
