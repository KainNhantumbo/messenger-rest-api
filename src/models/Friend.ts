import { Schema, model } from 'mongoose';

const friendSchema = new Schema(
  {
    user: {
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

const FriendModel = model('Friend', friendSchema);
export default FriendModel;
