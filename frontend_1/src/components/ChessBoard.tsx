import React, { useMemo, useState } from "react";
import { MOVE } from "@/screens/Game";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useGameStore } from "@/stores/game.store";

const ChessBoard = ({
  board,
  chess,
  socket,
}: {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  chess: Chess;
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const { gameId } = useGameStore();

  // Click logic
  function handleSquareClick(squareRep: Square) {
    const piece = chess.get(squareRep);

    // 1️⃣ Select or reselect a piece of current player's color
    if (piece && piece.color === chess.turn()) {
      setFrom(squareRep);
      const moves = chess
        .moves({ square: squareRep, verbose: true })
        .map((m) => m.to as Square);
      setLegalMoves(moves);
      return;
    }

    // 2️⃣ Try to make a move if one is selected
    if (from) {
      const isLegal = legalMoves.includes(squareRep);
      if (isLegal) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                gameId,
                move: {
                  from,
                  to: squareRep,
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
          const squareRep = (
            String.fromCharCode(97 + colIndex) + (8 - rowIndex)
          ) as Square;

          const isLight = (rowIndex + colIndex) % 2 === 0;

          return (
            <div
              key={colIndex}
              onClick={() => handleSquareClick(squareRep)}
              className={`relative w-16 h-16 flex items-center justify-center cursor-pointer ${
                isLight ? "bg-[#EBECD0]" : "bg-[#739552]"
              } ${from === squareRep ? "border-2 border-yellow-400" : ""}`}
            >
              {/* Dot for legal moves */}
              {legalMoves.includes(squareRep) && (
                <div
                  className="absolute w-4 h-4 bg-black/40 rounded-full"
                  style={{ zIndex: 5 }}
                ></div>
              )}

              {/* Piece */}
              {square && (
                <img
                  draggable
                  onDragStart={() => setFrom(squareRep)}
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
