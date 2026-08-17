import { randomUUID } from "crypto";
import { WebSocket } from "ws";
import { userJwtClaims } from "./utils/auth";

export class User {
  public socket: WebSocket;
  public id: string;
  public userId: string;
  public name: string;

  constructor(socket: WebSocket, userJwtClaims: userJwtClaims) {
    this.socket = socket;
    this.userId = userJwtClaims.userId;
    this.id = randomUUID();
    this.name = userJwtClaims.name;
  }
}

class SocketManager {
  private static instance: SocketManager;
  //mapping of room IDs to a list of User objects (users in that room)
  private interestedSockets: Map<string, User[]>;
  //reverse lookup from userId to their current roomId
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
    const existing = (this.interestedSockets.get(roomId) || []).filter(
      (u) => u.userId !== user.userId
    );
    this.interestedSockets.set(roomId, [...existing, user]);
    this.userRoomMappping.set(user.userId, roomId);
  }

  broadcast(roomId: string, message: string) {
    const users = this.interestedSockets.get(roomId);
    if (!users) {
      console.error("No users in room?");
      return;
    }

    users.forEach((user) => {
      if (user.socket.readyState !== WebSocket.OPEN) return;
      try {
        user.socket.send(message);
      } catch (e) {
        console.error(`Failed to send to user ${user.userId}:`, e);
      }
    });
  }

  removeUser(user: User) {
    const roomId = this.userRoomMappping.get(user.userId);
    // A socket that never joined a room (e.g. the lobby connection) is normal.
    if (!roomId) return;

    const UsersinRoom = this.interestedSockets.get(roomId) || [];
    // Match on socket identity, NOT userId: one user can briefly hold several
    // sockets while navigating, and a closing stale socket must not evict the
    // live one.
    const remainingUsers = UsersinRoom.filter((u) => u.socket !== user.socket);

    if (remainingUsers.length === 0) {
      this.interestedSockets.delete(roomId);
    } else {
      this.interestedSockets.set(roomId, remainingUsers);
    }

    // Only drop the reverse mapping once this user has no live socket left.
    if (!remainingUsers.some((u) => u.userId === user.userId)) {
      this.userRoomMappping.delete(user.userId);
    }
  }

  getSocket(userId: string): WebSocket | null {
    const roomId = this.userRoomMappping.get(userId);
    if (!roomId) {
      console.error("User is not in any room?");
      return null;
    }
    const users = this.interestedSockets.get(roomId);
    if (!users) {
      console.error(`No users in room? ${roomId}`);
      return null;
    }
    const user = users.find((u) => u.userId === userId);
    if (!user) {
      console.error(`User not found in room? ${userId}`);
      return null;
    }
    return user.socket;
  }
}

export const socketManager = SocketManager.getInstance();
