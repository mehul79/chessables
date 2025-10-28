import React, { useMemo, useState } from "react";
import { MOVE } from "@/screens/Game";
import { Color, PieceSymbol, Square } from "chess.js";
import { useGameStore } from "@/stores/game.store";

const ChessBoard = ({
  board,
  socket
}: {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const { gameId, setGameId } = useGameStore();

  const renderedBoard = useMemo(() => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((square, colIndex) => {
          const squareRep = (
            String.fromCharCode(97 + colIndex) + (8 - rowIndex)
          ) as Square;

          function handleDragStart(e: React.DragEvent) {
            setFrom(squareRep);
            console.log("Dragging from:", squareRep);
          }

          function handleDrop() {
            const to = squareRep;
            console.log("Dropped to:", to);
            if (from) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                  JSON.stringify({
                    type: MOVE,
                    payload: {
                      gameId,
                      move: {
                        from,
                        to,
                      },
                    },
                  })
                );
              } else {
                console.warn("Socket not open, cannot send move", { gameId, from, to });
              }
              setFrom(null);
            }
          }

          function handleDragOver(e: React.DragEvent) {
            e.preventDefault();
          }

          return (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              key={colIndex}
              onClick={() => {
                if (!from) {
                  setFrom(squareRep);
                } else {
                  socket.send(
                    JSON.stringify({
                      type: MOVE,
                      payload: {
                        from,
                        to: squareRep,
                      },
                    })
                  );
                  setFrom(null);
                }
              }}
              className={`w-16 h-16 flex items-center justify-center ${(rowIndex + colIndex) % 2 === 0
                  ? "bg-[#779556]"
                  : "bg-[#6b6b6b]"
                }`}
            >
              <div className="w-full h-full flex justify-center items-center">
                <div className="h-full justify-center flex flex-col items-center">
                  {square ? (
                    <img
                      className="w-4"
                      draggable
                      onDragStart={handleDragStart}
                      src={`/${square.color === "b"
                          ? square.type
                          : `${square.type.toUpperCase()} copy`
                        }.png`}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ));
  }, [board, from, socket]);

  return (
    <div className="">
      {renderedBoard}
    </div>
  );
};

export default ChessBoard;
