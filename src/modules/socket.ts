import Chat from '../models/Chat';
import Message from '../models/Message';
import { Server as HttpServer } from 'node:http';
import { Socket, Server } from 'socket.io';
import { corsDomains } from '../config/cors-options';

export default class SocketServer {
  public static instance: SocketServer;
  public io: Server;
  public users: Array<{ socketId: string; userId: string }>;

  constructor(server: HttpServer) {
    this.users = [];
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 20000,
      pingTimeout: 10000,
      cors: {
        origin: corsDomains,
        credentials: true,
      },
    });

    this.io.on('connect', (socket) => {
      this.listeners(socket);
    });
  }

  private listeners(socket: Socket): void {
    socket.on('online', (connectedUser: string) => {
      const user = this.users.some((user) => connectedUser === user.userId);

      if (!user) {
        this.users.push({ userId: connectedUser, socketId: socket.id });
      }
      socket.emit('online-users', this.users);
    });

    socket.on('disconnect', () => {
      this.users = this.users.filter((user) => user.socketId !== socket.id);
      socket.broadcast.emit('online-users', this.users);
    });

    /** messages */
    socket.on('send-message', (chatId) => {
      socket.emit('message-received', chatId);
      socket.broadcast.emit('reload-chats', chatId);
    });

    /** typings */
    socket.on('typing-start', (chatId) => {
      socket.broadcast.emit('typing-started', chatId);
    });

    socket.on('typing-stop', (chatId) => {
      socket.broadcast.emit('typing-stoped', chatId);
    });
  }
}
