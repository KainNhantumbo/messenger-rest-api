import { Response as IRes } from 'express';
import GenericError from './base-error';

export default function genericErrorHandler(err: GenericError, res: IRes) {
  const { message, statusCode } = err;
  return res.status(statusCode).json({
    message,
    code: statusCode,
  });
}
