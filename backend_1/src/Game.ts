import { Chess } from "chess.js";
import WebSocket from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import db from "./utils/db";
import { User } from "./SocketManager";
import {randomUUID} from "crypto";

type GAME_STATUS = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIME_UP' | 'PLAYER_EXIT';
type GAME_RESULT = "WHITE_WINS" | "BLACK_WINS" | "DRAW";

const GAME_TIME_MS = 10 * 60 * 60 * 1000;

export function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) {
    return false;
  }

  const piece = chess.get(from);

  if (piece?.type !== 'p') {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!['1', '8'].some((it) => to.endsWith(it))) {
    return false;
  }

  return chess
    .moves({ square: from, verbose: true })
    .map((it) => it.to)
    .includes(to);
}

export class Game {
  public gameId: string;
  public player1UserId: string;
  public player2UserId: string | null;
  private board: Chess;
  private timer: NodeJS.Timeout | null = null;
  private moveTimer: NodeJS.Timeout | null = null;
  public result: GAME_RESULT | null = null;
  private player1TimeConsumed = 0;
  private player2TimeConsumed = 0;
  private startTime = new Date(Date.now());
  private lastMoveTime = new Date(Date.now()); 


  constructor(player1UserId: string, player2UserId: string) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.board = new Chess();
    this.startTime = new Date();
    this.gameId = randomUUID();

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        playload: {
          color: "white",
          startTime: this.startTime,
          opponentName: "lol"
        },
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        playload: {
          color: "black",
          startTime: this.startTime,
          opponentName: "lol"
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    //validation here
    //is this user valid
    //is the move valid

    if (this.board.turn() === "w" && socket != this.player1) {
      console.log("Not white's turn");
      return;
    }

    if (this.board.turn() === "b" && socket != this.player2) {
      console.log("Not black's turn");
      return;
    }

    try {
      this.board.move(move);
      console.log("Move made backend:: ", move);
    } catch (e) {
      console.log("ERROR hehahaha: ", e);
      return;
    }

    if (this.board.isGameOver()) {
      console.log("brooo");

      this.player1.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      this.player2.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
    }

    this.player1.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      })
    );
    this.player2.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      })
    );

    //update the board
    //push the move

    //check if the game is over

    //send the updated board to both the users
  }
}
