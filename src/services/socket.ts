import { writeFileSync } from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IFileProps } from '../@types/interfaces';
import { v4 as uuidV4 } from 'uuid';
import MessageModel from '../models/Message';
import { writeFile } from 'fs/promises';

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
    // online stats
    socket.on('new-user', (connectedUser: string) => {
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
      console.log('User disconnected.');
    });

    console.log(`Socket ready ${socket.id}`);

    socket.on('send-message', (data) => {
      console.log('message received', data);
    });

    // typing --------------------
    socket.on('typing-started', () => {
      socket.broadcast.emit('typing-started-server');
    });

    socket.on('typing-stoped', () => {
      socket.broadcast.emit('typing-stoped-server');
    });

    // catch files ---------------------------
    socket.on('file-upload', async (message) => {
      try {
        const { file, ...data } = message;
        var { fileData, type } = file;
        if (type.includes('image')) {
          const fileExtension = file.split(';base64,').pop();
          console.log(fileExtension);
          fileData = type.split(';base64,').pop() || '';
          const ramdom_id = uuidV4();
          const fileWithPath = path.join(
            __dirname + `/uploads/images/${ramdom_id}.${fileExtension}`
          );

          await writeFile(fileWithPath, fileData, {
            encoding: 'base64',
          });
          await MessageModel.create({ file: fileWithPath, ...data });
        }
      } catch (error) {
        console.error(error);
      }
    });
  });
}
