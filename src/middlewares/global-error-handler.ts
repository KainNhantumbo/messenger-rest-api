import {
  Request as IReq,
  Response as IRes,
  NextFunction as INext,
} from 'express';
import AppError from '../error/base-error';
import genericErrorHandler from '../error/generic-error-handler';
import { config } from 'dotenv';
import { eventLogger } from './logger';
import { JsonWebTokenError } from 'jsonwebtoken';

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
  error: Error | AppError,
  req: IReq,
  res: IRes,
  next: INext
): IRes<any, Record<string, any>> | undefined {
  if (error instanceof AppError) return genericErrorHandler(error, res);

  if (error.name == 'MongoServerError') {
    if (error.message.split(' ')[0] == 'E11000') {
      return res.status(409).json({
        status: 'Conflict Error',
        code: 409,
        message: 'This e-mail is already used by another account.',
      });
    }
  }

  if (error.name === 'PayloadTooLargeError')
    return res.status(413).json({
      status: 'PayloadTooLargeError',
      code: 413,
      message: 'The profile image choosen is too large',
    });

  if (error instanceof JsonWebTokenError)
    return res.status(401).json({
      status: 'Authorization Error',
      code: 401,
      message: 'Unauthorized: invalid token.',
    });

  if (error.name == 'ValidationError') {
    const errorMessage = Object.values((error as any).errors)
      .map((obj: any) => obj.message)
      .join('. ');
    return res.status(400).json({
      status: 'Data Validation Error',
      code: 400,
      message: errorMessage,
    });
  }

  if (process.env.NODE_ENV == 'development') {
    console.log(
      `An uncaught error has ocurred: ${error.message}\t${error.stack}`
    );
    eventLogger({
      message: error.stack || error.message,
      fileName: 'uncaught-errors.log',
    });
  }

  res.status(500).json({
    status: 'Internal Server Error',
    code: 500,
    message: 'An error occured while processing your request.',
  });
}
