import Bootstrap from './modules/server';
import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimiter from './config/rate-limit';
import globalErrorHandler from './middlewares/global-error-handler';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import { logger } from './middlewares/logger';
import { corsDomains, corsOptions } from './config/cors-options';
import { error404Route } from './routes/not-found';
import { userRoutes } from './routes/users';
import { messageRoutes } from './routes/messages';
import { chatRoutes } from './routes/chats';
import { authRoutes } from './routes/auth';
import { friendRoutes } from './routes/friends';
import SocketServer from './modules/socket';

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 5200;
const DB_URI = process.env.MONGO_URI || '';
const app: Application = express();
const httpServer = http.createServer(app);

//==== middlewares ====//
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(logger);

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/chats', chatRoutes);


// errors
app.use(error404Route);
app.use(globalErrorHandler);

//socket server functions
new SocketServer(httpServer);

// server init
new Bootstrap({
  PORT,
  db_uri: DB_URI,
  app: httpServer,
}).init();
