import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';
import { userJwtClaims } from './utils/auth';



//User class represents a user connected to the WebSocket server
export class User {
  public socket: WebSocket
  public userId: string;
  public name: string;

  constructor(socket: WebSocket, userJwtClaims: userJwtClaims) {
    this.socket = socket;
    this.userId = userJwtClaims.userId;
    this.name = userJwtClaims.name;
  }
}


// SocketManager is a singleton class that manages WebSocket connections and broadcasts messages to users in specific rooms.
class SocketManager {
  private static instance: SocketManager;
  // A map that holds room IDs as keys and arrays of User objects as values, representing users interested in each room.
  private interestedSockets: Map<string, User[]>;
  // A map that holds user IDs as keys and room IDs as values, representing the room each user is interested in.
  private userRoomMappping: Map<string, string>;

  private constructor() {
    this.interestedSockets = new Map<string, User[]>();
    this.userRoomMappping = new Map<string, string>();
  }

  static getInstance() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }

    SocketManager.instance = new SocketManager();
    return SocketManager.instance;
  }

  addUser(user: User, roomId: string) {
    this.interestedSockets.set(roomId, [
      ...(this.interestedSockets.get(roomId) || []),
      user,
    ]);
    this.userRoomMappping.set(user.userId, roomId);
  }

  broadcast(roomId: string, message: string) {
    const users = this.interestedSockets.get(roomId);
    if (!users) {
      console.error('No users in room?');
      return;
    }

    users.forEach((user) => {
      user.socket.send(message);
    });
  }

  removeUser(user: User) {
    const roomId = this.userRoomMappping.get(user.userId);
    if (!roomId) {
      console.error('User was not interested in any room?');
      return;
    }
    const room = this.interestedSockets.get(roomId) || []
    const remainingUsers = room.filter(u =>
      u.userId !== user.userId
    )
    this.interestedSockets.set(
      roomId,
      remainingUsers
    );
    if (this.interestedSockets.get(roomId)?.length === 0) {
      this.interestedSockets.delete(roomId);
    }
    this.userRoomMappping.delete(user.userId);
  }
}

export const socketManager = SocketManager.getInstance()