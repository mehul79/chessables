import { Chess } from "chess.js";
import WebSocket from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./utils/messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        playload: {
          color: "white",
          startTime: this.startTime,
        },
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        playload: {
          color: "black",
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
