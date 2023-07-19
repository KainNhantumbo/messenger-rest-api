import { Schema, model } from 'mongoose';

export type TChat = {
  author: Schema.Types.ObjectId;
  friend: Schema.Types.ObjectId;
}

const chatSchema = new Schema<TChat>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const ChatModel = model('Chat', chatSchema);
export default ChatModel;
