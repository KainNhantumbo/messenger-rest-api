import { writeFileSync } from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IFileProps } from '../@types/interfaces';
import { v4 as uuidV4 } from 'uuid';

type SocketType = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export default function socketService(io: SocketType) {
  return io.on('connection', (socket) => {
    socket.on('disconnect', () => {
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
    socket.on('file-upload', async ({ file, type }: IFileProps) => {
      if (type.includes('image')) {
        const fileExtension = file.split(';base64,').pop();
        console.log(fileExtension);
        file = type.split(';base64,').pop() || '';
        const filename = uuidV4();

        writeFileSync(
          path.join(__dirname + `/uploads/${filename}.${fileExtension}`),
          file,
          {
            encoding: 'base64',
          }
        );
      }
    });
  });
}
