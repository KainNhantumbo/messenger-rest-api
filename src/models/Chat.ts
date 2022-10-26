import { Schema, model } from 'mongoose';

interface IChat {
  members: Array<string> | undefined;
}

const chatSchema = new Schema<IChat>(
  {
    members: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const ChatModel = model('Chat', chatSchema);

export default ChatModel;
