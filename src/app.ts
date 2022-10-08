import express, { Application } from 'express';
import http from 'http'

const app: Application = express();
const httpServer = http.createServer(app)
