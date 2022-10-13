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

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 4800;

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

//socket functions
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
});

// errors
app.use(globalErrorHandler);

// server init
const server = new Bootstrap(httpServer, PORT, process.env.MONGO_URI || '');
server.init();
