import {
  Request as IReq,
  Response as IRes,
  NextFunction as INext,
} from 'express';
import { HandledFunction } from '../@types/functions';

/**
 * Wrapper function for global error handling.
 * @param fn asynchronous function to be wrapped and error handled.
 * @returns Promise<...>
 */
const asyncWrapper =
  (fn: HandledFunction) => (req: IReq, res: IRes, next: INext) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncWrapper;
