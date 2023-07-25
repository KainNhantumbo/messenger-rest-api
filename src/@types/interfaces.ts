import { Schema, Types } from 'mongoose';

export interface IEventLogger {
  message: string;
  fileName: string;
}

export interface IFileProps {
  file: string;
  type: string;
}

export interface UserData {
  first_name: string;
  last_name: string;
  user_name: string;
  picture: { id: string; extension: string; filePath: string };
  bio: string;
  email: string;
  password: string;
  recovery_key: string;
  friends: Schema.Types.ObjectId;
  _id: Types.ObjectId;
}
