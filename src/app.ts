import Bootstrap from './utils/server';
import express, { Application } from 'express';
import socketService from './services/socket';
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

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 5200;

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: corsDomains, credentials: true },
});

//==== middlewares ====//
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(logger);

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/chats', chatRoutes);

//socket server functions
socketService(io);

// errors
app.use(error404Route);
app.use(globalErrorHandler);

// server init
const server = new Bootstrap(httpServer, PORT, process.env.MONGO_URI || '');
server.init();
