import {
  Request as IReq,
  Response as IRes,
  NextFunction as INextFn,
} from 'express';
import GenericError from '../error/base-error';
import { verifyToken } from '../utils/jwt-helpers';
import { config } from 'dotenv';
import asyncWrapper from '../utils/async-wrapper';

// loads environment variables
config();

const verifyTokenMiddleware = asyncWrapper(
  async (req: IReq, res: IRes, next: INextFn): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new GenericError('Unauthorized: invalid token.', 401);
    const token = authHeader.split(' ')[1];
    const decodedPayload: any = await verifyToken(
      token,
      process.env.ACCESS_TOKEN || ''
    );
    if (!decodedPayload) throw new GenericError('Invalid token.', 401);
    // inserts user id into request middleware
    req.body.user = decodedPayload.user_id;
    next();
  }
);

export default verifyTokenMiddleware;
