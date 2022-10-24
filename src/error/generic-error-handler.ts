import { Response as IRes } from 'express';
import AppError from './base-error';

export default function genericErrorHandler(err: AppError, res: IRes) {
  const { message, statusCode } = err;
  return res.status(statusCode).json({
    message,
    code: statusCode,
  });
}
