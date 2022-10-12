import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import Bootstrap from './utils/server';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import globalErrorHandler from './middlewares/global-error-handler';
import rateLimiter from './config/rate-limit';

//server configuration
config(); // loads environment variables
const PORT = process.env.PORT || 4800;
const corsDomains: string[] = ['http://localhost:3000'];

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
	cors: { origin: corsDomains, credentials: true },
});

const cors_options: CorsOptions = {
	origin: corsDomains,
	// methods: ['GET', 'POST', 'DELETE', 'PATCH'],
	optionsSuccessStatus: 200,
};

// middlewares
app.use(cors(cors_options));
app.use(rateLimiter);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());


//functions
io.on('connection', (socket) => {
	console.log(`Socket ready ${socket.id}`);
	socket.on('send-message', (data) => {
		console.log('message received', data);
	});

	socket.on('disconnect', () => {
		console.log('User disconnected.');
	});

	socket.on('typing', () => {
		socket.broadcast.emit('server-typing');
	});
});

// errors
app.use(globalErrorHandler)

// server init
const server = new Bootstrap(httpServer, PORT, process.env.MONGO_URI || '');
server.init();
