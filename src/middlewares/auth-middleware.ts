import {
  Request as IReq,
  Response as IRes,
  NextFunction as INextFn,
} from 'express';
import AppError from '../error/base-error';
import { verifyToken } from '../utils/jwt-helpers';
import { config } from 'dotenv';
import asyncWrapper from '../utils/async-wrapper';

// loads environment variables
config();

const authenticate = asyncWrapper(
  async (req: IReq, res: IRes, next: INextFn): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new AppError('Unauthorized: invalid token.', 401);
    const token = authHeader.split(' ')[1];
    const decodedPayload: any = await verifyToken(
      token,
      process.env.ACCESS_TOKEN || ''
    );
    if (!decodedPayload) throw new AppError('Invalid token.', 401);
    // inserts user id into request middleware
    req.body.user = decodedPayload.user_id;
    next();
  }
);

export default authenticate;
