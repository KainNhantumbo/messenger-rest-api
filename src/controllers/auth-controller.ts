import * as bcrypt from 'bcrypt';
import { Request as IReq, Response as IRes } from 'express';
import { createToken, verifyToken } from '../utils/jwt-helpers';
import AppError from '../error/base-error';
import UserModel from '../models/User';
import { config } from 'dotenv';

config(); // loads environment variables

export default class authController {
  private readonly PROD_ENV: boolean;

  constructor() {
    this.PROD_ENV = process.env.NODE_ENV == 'development' ? true : false;
  }

  async login(req: IReq, res: IRes): Promise<void> {
    const { password, email } = req.body;
    if (!password || !email)
      throw new AppError('Please provide your e-mail and password.', 400);

    const user = await UserModel.findOne({ email: email });
    if (!user)
      throw new AppError(
        'Account not found. Please check your e-mail and try again.',
        404
      );

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      throw new AppError('Wrong password. Please check and try again.', 401);

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
      .status(200)
      .cookie('userToken', refreshToken, {
        httpOnly: true,
        secure: this.PROD_ENV && true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ token: accessToken, userId: user_id });
  }

  // refresh token function
  async refresh(req: IReq, res: IRes): Promise<void> {
    const tokenCookie = req.cookies.userToken;
    if (!tokenCookie) throw new AppError('Unauthorized: Invalid token.', 401);
    const decodedPayload: any = await verifyToken(
      tokenCookie,
      process.env.REFRESH_TOKEN || ''
    );

    if (!decodedPayload) throw new AppError('Forbidden.', 403);
    const user = await UserModel.findOne({ _id: decodedPayload.user_id });
    if (!user) throw new AppError('Unauthorized: invalid token.', 401);
    const accessToken = await createToken(
      user._id as unknown as string,
      process.env.ACCESS_TOKEN || '',
      '20s'
    );
    res.status(200).json({ accessToken });
  }

  logout(req: IReq, res: IRes): IRes<any, Record<string, any>> | undefined {
    const tokenCookie = req.cookies.userToken;
    if (!tokenCookie)
      return res.status(401).json({ message: 'Invalid cookie' });
    res
      .status(204)
      .clearCookie('userToken', {
        httpOnly: true,
        secure: this.PROD_ENV && true,
        sameSite: 'strict',
      })
      .json({ message: 'Cookie cleared.' });
  }
}
