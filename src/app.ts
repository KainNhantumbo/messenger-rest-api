import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import Bootstrap from './modules/server';
import SocketServer from './modules/socket';
import rateLimiter from './config/rate-limit';
import express, { Application } from 'express';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { chatRoutes } from './routes/chats';
import { friendRoutes } from './routes/friends';
import { messageRoutes } from './routes/messages';
import { error404Route } from './routes/not-found';
import { corsOptions } from './config/cors-options';
import { globalErrorHandler } from './middlewares/global-error-handler';

//server configuration
dotenv.config(); // loads environment variables
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
