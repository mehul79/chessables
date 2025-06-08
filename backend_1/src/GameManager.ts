import WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import db from "./utils/db";
import { User } from "@prisma/client";
import { socketManager } from "./SocketManager";

export class GameManager {
  private games: Game[];
  private pendingUser: string | null;
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error('User not found?');
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    socketManager.removeUser(user);
  }

  removeGame(gameId: string) {
    this.games = this.games.filter((g) => g.gameId !== gameId);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      //checks the type of the data
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null; // Reset pendingUser after creating game
        } else {
          this.pendingUser = socket;
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) => game.player1 == socket || game.player2 == socket
        );
        if (game) {
          // console.log("message.payload.move ", message.payload.move);
          game.makeMove(socket, message.payload);
        }
      }
    });
  }
}
