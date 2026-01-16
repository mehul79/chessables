import { WebSocket } from "ws";
import {
  INIT_GAME,
  MOVE,
  GAME_ALERT,
  GAME_ADDED,
  GAME_ENDED,
  EXIT_GAME,
  RESIGN,
  DRAW_OFFER,
  JOIN_GAME,
} from "./messages";
import { Game } from "./Game";
import db from "./utils/db";
import { socketManager, User } from "./SocketManager";
import { GameStatus } from "@prisma/client";

export class GameManager {
  private games: Game[] = [];
  private pendingGameId: string | null = null;
  private users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
    this.attachHandlers(user);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((u) => u.socket === socket);
    if (!user) return;

    this.users = this.users.filter((u) => u.socket !== socket);
    socketManager.removeUser(user);
  }

  private removeGame(gameId: string) {
    this.games = this.games.filter((g) => g.gameId !== gameId);
  }

  // ------------------------------------------------
  // SOCKET MESSAGE HANDLER
  // ------------------------------------------------
  private attachHandlers(user: User) {
    user.socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      // ------------------------------------------------
      // INIT_GAME → CREATE NEW GAME (MATCHMAKING ONLY)
      // ------------------------------------------------
      if (message.type === INIT_GAME) {
        if (this.pendingGameId) {
          const game = this.games.find(
            (g) => g.gameId === this.pendingGameId
          );
          if (!game) return;

          if (game.player1UserId === user.userId) {
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: { message: "Cannot play against yourself" },
              })
            );
            return;
          }

          socketManager.addUser(user, game.gameId);
          await game.updateSecondPlayer(user.userId);
          this.pendingGameId = null;
          return;
        }

        const game = new Game(user.userId, null);
        this.games.push(game);
        this.pendingGameId = game.gameId;

        socketManager.addUser(user, game.gameId);
        socketManager.broadcast(
          game.gameId,
          JSON.stringify({
            type: GAME_ADDED,
            gameId: game.gameId,
          })
        );
        return;
      }

      // JOIN_GAME → ATTACH SOCKET TO EXISTING GAME
      if (message.type === JOIN_GAME) {
        const { gameId } = message.payload;
        if (!gameId) return;

        let game = this.games.find((g) => g.gameId === gameId);

        // Rehydrate game into memory if needed
        if (!game) {
          const gameFromDb = await db.game.findUnique({
            where: { id: gameId },
            include: {
              moves: { orderBy: { moveNumber: "asc" } },
            },
          });

          if (!gameFromDb) return;

          if (gameFromDb.status !== GameStatus.IN_PROGRESS) return;

          game = new Game(
            gameFromDb.whitePlayerId!,
            gameFromDb.blackPlayerId!,
            gameFromDb.id,
            gameFromDb.startAt
          );

          game.seedMoves(gameFromDb.moves);
          this.games.push(game);
        }

        socketManager.addUser(user, gameId);
        return;
      }

      // ------------------------------------------------
      // MOVE → LIVE GAME UPDATE
      // ------------------------------------------------
      if (message.type === MOVE) {
        const { gameId, move } = message.payload;
        const game = this.games.find((g) => g.gameId === gameId);
        if (!game) return;

        await game.makeMove(user, move);

        if (game.result) {
          this.removeGame(game.gameId);
        }
        return;
      }

      // ------------------------------------------------
      // EXIT GAME
      // ------------------------------------------------
      if (message.type === EXIT_GAME) {
        const game = this.games.find(
          (g) => g.gameId === message.payload.gameId
        );
        if (!game) return;

        game.exitGame(user);
        this.removeGame(game.gameId);
        return;
      }

      // ------------------------------------------------
      // RESIGN
      // ------------------------------------------------
      if (message.type === RESIGN) {
        const game = this.games.find(
          (g) => g.gameId === message.payload.gameId
        );
        if (!game) return;

        game.resignGame(user);
        this.removeGame(game.gameId);
        return;
      }
    });
  }
}
