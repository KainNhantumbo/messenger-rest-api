import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt';

interface IUser {
  first_name: string;
  last_name: string;
  user_name: string;
  bio: string;
  email: string;
  picture: { id: string; extension: string; filePath: string };
  password: string;
  recovery_key: string;
  friends: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    user_name: {
      type: String,
      trim: true,
      required: [true, 'Username must be provided'],
      maxlength: [20, 'Provided user name is too long'],
      unique: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: [true, 'First name must be provided'],
      maxlength: [32, 'Provided first name is too long'],
    },
    last_name: {
      type: String,
      trim: true,
      required: [true, 'Last name must be provided.'],
      maxlength: [32, 'Provided last name is too long'],
    },
    bio: {
      type: String,
      trim: true,
      default: 'Hello, I am online on OpenChat!',
      maxlength: [64, 'Bio can only have 64 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your e-mail adress'],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid e-mail adress',
      ],
      unique: true,
      maxlength: [64, 'Provided e-mail adress is too long'],
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Friend',
      },
    ],
    password: {
      type: String,
      minlength: [6, 'The password must have at least 6 characters'],
      required: [true, 'Please provide a password'],
    },
    recovery_key: {
      type: String,
      required: [true, 'Please provide user account recovery key'],
    },
    picture: {
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

//  hashing user password and recovery key
UserSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.recovery_key = await bcrypt.hash(this.recovery_key, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

const UserModel = model('User', UserSchema);
export default UserModel;
