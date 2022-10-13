import {
  Request as IReq,
  Response as IRes,
  NextFunction as INext,
} from 'express';
import GenericError from '../error/base-error';
import genericErrorHandler from '../error/generic-error-handler';
import { config } from 'dotenv';
// loads environment variables
config();

/**
 * Error handler middleware.
 * @param error error object
 * @param req request
 * @param res response
 * @param next next middleware Function
 */
export default function globalErrorHandler(
  error: Error | GenericError,
  req: IReq,
  res: IRes,
  next: INext
): IRes<any, Record<string, any>> | undefined {
  if (error instanceof GenericError) return genericErrorHandler(error, res);

  if (error.name == 'MongoServerError') {
    if (error.message.split(' ')[0] == 'E11000') {
      return res.status(409).json({
        status: 'Conflict Error',
        code: 409,
        message:
          'This e-mail is already used by another account. Try another one.',
      });
    }
  }

  if (process.env.NODE_ENV == 'development') {
    console.log(`An error has ocurred: ${error.message}\t${error.stack}`);
  }

    res.status(500).json({
      status: 'Internal Server Error',
      code: 500,
      message: 'An error occured while processing your request.',
    });
}
