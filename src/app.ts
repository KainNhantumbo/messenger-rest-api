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
const corsDomains: string[] = ['http://localhost:3000'];

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
	cors: { origin: corsDomains, credentials: true },
});

const limiter: RateLimitRequestHandler = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 1200,
	standardHeaders: true,
	legacyHeaders: false,
});

const cors_options: CorsOptions = {
	origin: corsDomains,
	// methods: ['GET', 'POST', 'DELETE', 'PATCH'],
	optionsSuccessStatus: 200,
};

// middlewares
app.use(cors(cors_options));
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

//error

//functions
io.on('connection', (socket)=> {
  console.log(`Socket ready ${socket._onconnect}`)
})

// server init
const server = new Bootstrap(httpServer, PORT, process.env.MONGO_URI || '');
server.init();
