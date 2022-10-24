import express, { Application } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import Bootstrap from './utils/server';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import globalErrorHandler from './middlewares/global-error-handler';
import rateLimiter from './config/rate-limit';
import { corsDomains, corsOptions } from './config/cors-options';
import { logger } from './middlewares/logger';
import { error404Route } from './routes/not-found';
import { userRoutes } from './routes/users';
import { IFileProps } from './@types/interfaces';
import { writeFile, writeFileSync } from 'fs';

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 5200;

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: corsDomains, credentials: true },
});

// middlewares
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use('/api/v1/users', userRoutes);

//socket server functions
io.on('connection', (socket) => {
  console.log(`Socket ready ${socket.id}`);
  socket.on('send-message', (data) => {
    console.log('message received', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected.');
  });

  // typing
  socket.on('typing-started', () => {
    socket.broadcast.emit('typing-started-server');
  });
  socket.on('typing-stoped', () => {
    socket.broadcast.emit('typing-stoped-server');
  });

  // catch files
  socket.on('file-upload', async ({ file, type }: IFileProps) => {
    if (type.includes('image')) {
      file = 'data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgA';
      const fileExtension = file.split(';base64,').pop();
      console.log(fileExtension);
      file = type.split(';base64,').pop() || '';

      writeFileSync('img.png', file, { encoding: 'base64' });
    }
  });
});

// errors
app.use(error404Route);
app.use(globalErrorHandler);

// server init
const server = new Bootstrap(httpServer, PORT, process.env.MONGO_URI || '');
server.init();
