import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

type SocketType = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

type ConnectedUserType = { userId: string; socketId: string };

export default function socketService(io: SocketType) {
  var activeUsers: Array<ConnectedUserType> = [];

  return io.on('connection', (socket) => {
    socket.on('online', (connectedUser: string) => {
      if (
        !activeUsers.some((activeUser) => connectedUser === activeUser.userId)
      ) {
        activeUsers.push({ userId: connectedUser, socketId: socket.id });
      }
      socket.broadcast.emit('online-users', activeUsers);
    });

    socket.on('disconnect', () => {
      activeUsers = activeUsers.filter(
        (activeUser) => activeUser.socketId !== socket.id
      );
      socket.broadcast.emit('online-users', activeUsers);
    });

    socket.on('send-message', () => {
      socket.emit('message-received');
    });

    socket.on('typing-start', () => {
      socket.broadcast.emit('typing-started');
    });

    socket.on('typing-stop', () => {
      socket.broadcast.emit('typing-stoped');
    });

    socket.on('file-upload', () => {
      socket.emit('file-uploaded');
    });
  });
}
