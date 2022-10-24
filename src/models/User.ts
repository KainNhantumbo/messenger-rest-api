import mongoose, { Schema, model } from 'mongoose';

interface IUser {
  first_name: string;
  last_name: string;
  user_name: string;
  bio: string;
  email: string;
  avatar: string;
  password: string;
  friends: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    user_name: {
      type: String,
      trim: true,
      required: [true, 'Username must be provided.'],
      maxlength: [20, 'Provided user name is too long.'],
      unique: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: [true, 'First name must be provided.'],
      maxlength: [64, 'Provided first name is too long.'],
    },
    last_name: {
      type: String,
      trim: true,
      required: [true, 'Last name must be provided.'],
      maxlength: [64, 'Provided last name is too long.'],
    },
    bio: {
      type: String,
      trim: true,
      default: 'Hello, I am online on OpenChat!',
      maxlength: [64, 'Bio can only have 64 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your e-mail adress.'],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid e-mail adress.',
      ],
      unique: true,
      maxlength: [64, 'Provided e-mail adress is too long.'],
    },
    friends: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User'
    },
    password: {
      type: String,
      minlength: [6, 'The password must have at least 6 charaters.'],
      required: [true, 'Please provide a password.'],
    },
  },
  { timestamps: true }
);

const UserModel = model('User', UserSchema);
export default UserModel;
