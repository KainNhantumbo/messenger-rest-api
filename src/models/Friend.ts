import { Schema, model } from 'mongoose';

const friendSchema = new Schema(
  {
    belongsTo: {
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

const friendModel = model('Friend', friendSchema);
export default friendModel;
