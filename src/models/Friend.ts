import { Schema, model } from 'mongoose';

interface IFriend {
  user: Schema.Types.ObjectId;
  friend: Schema.Types.ObjectId;
}

const friendSchema = new Schema<IFriend>(
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
