import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

type _TServer = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export default class ChatService {
  static getChats = async (socket: _TServer, userId: string) => {
    try {
      const foundChats = await Chat.find({
        $or: [{ author: userId }, { friend: userId }],
      }).lean();

      if (foundChats.length === 0) {
        return socket.send([]);
      }
      const transformChats = async (chat: any) => {
        const [friendId] = [chat.author, chat.friend].filter(
          (id) => id != userId
        );
        const foundMessage = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 'desc' })
          .lean();

        const foundUser = await User.findOne({ _id: friendId })
          .select('user_name picture')
          .lean();

        if (!foundUser)
          return {
            _id: chat._id,
            user_name: '[ DELETED ACCOUNT ]',
            message: foundMessage,
            avatar: '',
            createdAt: (chat as any).createdAt,
          };

        const { picture } = foundUser;
        let data = {
          _id: chat._id,
          user_name: foundUser.user_name,
          message: foundMessage,
          avatar: '',
          createdAt: (chat as any).createdAt,
        };

        if (picture.filePath && existsSync(picture.filePath)) {
          const avatarFileData = await readFile(picture.filePath, {
            encoding: 'base64',
          });
          data.avatar = `data:image/${picture.extension};base64,${avatarFileData}`;
          return data;
        }
        return data;
      };
      const data: any[] = [];
      await Promise.allSettled(foundChats.map(transformChats)).then(
        (result: PromiseSettledResult<any>[]) => {
          result.forEach((element) => {
            data.push((element as any).value);
          });
        }
      );
      socket.emit('reloaded-chats', data);
    } catch (error) {
      console.error(error);
    }
  };
}
