import express, { Application } from 'express';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import cors, { CorsOptions } from 'cors';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import Bootstrap from './utils/server';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 4800;
const app: Application = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const limiter: RateLimitRequestHandler = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 1200,
	standardHeaders: true,
	legacyHeaders: false,
});
const cors_options: CorsOptions = {
	origin: ['http://localhost:3000'],
	// methods: ['GET', 'POST', 'DELETE', 'PATCH'],
	optionsSuccessStatus: 200,
};

// middlewares
app.use(cors(cors_options));
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// server init
const server = new Bootstrap(app, PORT, process.env.MONGO_URI || '');
server.init();
