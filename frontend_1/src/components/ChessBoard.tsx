import React, { useMemo, useState } from "react";
import { MOVE } from "@/screens/GameLobby";
import { Chess, Color, PieceSymbol, Square } from "chess.js";


const ChessBoard = ({
    board,
    chess,
    socket,
    isMyTurn,
     gameId,
  }: {
    board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
    chess: Chess;
    socket: WebSocket;
    isMyTurn: boolean;
    gameId: string;
  }) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  // Click logic
  function handleSquareClick(squareRepresentation: Square) {
    if (!isMyTurn) {
       return;
     }
    const piece = chess.get(squareRepresentation);

    // 1️⃣ Select or reselect a piece of current player's color
    if (piece && piece.color === chess.turn()) {
      setFrom(squareRepresentation);
      const moves = chess
        .moves({ square: squareRepresentation, verbose: true })
        .map((m) => m.to as Square);
      setLegalMoves(moves);
      return;
    }

    // 2️⃣ Try to make a move if one is selected
    if (from) {
      const isLegal = legalMoves.includes(squareRepresentation);
      if (isLegal) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                gameId,
                move: {
                  from,
                  to: squareRepresentation,
                },
              },
            })
          );
        } else {
          console.warn("Socket not open, cannot send move");
        }
      }
      setFrom(null);
      setLegalMoves([]);
    }
  }

  const renderedBoard = useMemo(() => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((square, colIndex) => {
          const squareRepresentation = (
            String.fromCharCode(97 + colIndex) + (8 - rowIndex)
          ) as Square;

          const isLight = (rowIndex + colIndex) % 2 === 0;

          return (
            <div
              key={colIndex}
              onClick={() => handleSquareClick(squareRepresentation)}
              className={`relative w-16 h-16 flex items-center justify-center cursor-pointer ${
                isLight ? "bg-[#EBECD0]" : "bg-[#739552]"
              } ${from === squareRepresentation ? "border-2 border-yellow-400" : ""}`}
            >
              {/* Dot for legal moves */}
              {legalMoves.includes(squareRepresentation) && (
                <div
                  className="absolute w-4 h-4 bg-black/40 rounded-full"
                  style={{ zIndex: 5 }}
                ></div>
              )}

              {/* Piece */}
              {square && (
                <img
                  draggable={false} //makes the image both non draggle and pickable too
                  className="w-14 z-10 select-none"
                  src={`/${
                    square.color === "b"
                      ? square.type
                      : `${square.type.toUpperCase()} copy`
                  }.png`}
                />
              )}
            </div>
          );
        })}
      </div>
    ));
  }, [board, from, legalMoves, chess]);

  return <div>{renderedBoard}</div>;
};

export default ChessBoard;
