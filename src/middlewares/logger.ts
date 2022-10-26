import {
  Request as IReq,
  Response as IRes,
  NextFunction as INext,
} from 'express';
import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';
import { IEventLogger } from '../@types/interfaces';

const eventLogger = async <T extends IEventLogger>({
  message,
  fileName,
}: T): Promise<void> => {
  const date = new Date().toISOString();
  const log = `${date}\t${uuidV4()}\t${message}\n`;

  try {
    if (!existsSync(path.join(__dirname, '..', 'logs'))) {
      await mkdir(path.join(path.join(__dirname, '..', 'logs')));
    }
    await appendFile(path.join(__dirname, '..', 'logs', fileName), log);
  } catch (err) {
    console.error(err);
  }
};

const logger = (req: IReq, res: IRes, next: INext) => {
  eventLogger({
    message: `${req.method}:\t${req.url}\t${req.headers.origin} `,
    fileName: 'request-logs.log',
  });

  console.log(`${req.method}\t${req.path}\t${req.url} `);
  next();
};

export { eventLogger, logger };
