import * as bcrypt from 'bcrypt';
import { Request as IReq, Response as IRes } from 'express';
import { createToken, verifyToken } from '../utils/jwt-helpers';
import GenericError from '../error/base-error';
import UserModel from '../models/User';
import { config } from 'dotenv';

config(); // loads environment variables

const login = async (req: IReq, res: IRes) => {
  const { password, email } = req.body;
  if (!password || !email)
    throw new GenericError('Please provide your e-mail and password.', 400);

  const user = await UserModel.findOne({ email: email });
  if (!user)
    throw new GenericError(
      'Account not found. Please check your e-mail and try again.',
      404
    );

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    throw new GenericError('Wrong password. Please check and try again.', 401);

  const user_id: any = user._id;

  const accessToken = await createToken(
    user_id,
    process.env.ACCESS_TOKEN || '',
    '20s'
  );
  const refreshToken = await createToken(
    user_id,
    process.env.REFRESH_TOKEN || '',
    '60s'
  );

  res
    .status(202)
    .cookie('token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({ accessToken });
};

const refresh = async (req: IReq, res: IRes) => {
  
};
const logout = async (req: IReq, res: IRes) => {};

export { login, logout, refresh };
