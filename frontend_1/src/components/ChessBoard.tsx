import { MOVE } from "@/screens/Game";
import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";

const ChessBoard = ({
  board,
  socket
}: {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [to, setTo] = useState<Square | null>(null);

  return (
    <div className="text-black border-2 border-amber-400">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((square, colIndex) => {
            const squareRepesentation = (
              String.fromCharCode(97 + (colIndex % 8)) + "" + (8 - Math.floor(rowIndex))
            ) as Square;

            return (
              <div
                onClick={() => {
                  if (!from) {
                    // setFrom(square?.square ? square.square : null);
                    setFrom(squareRepesentation);
                  } else {
                    // setTo(square?.square ? square.square : null);
                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        payload: {
                          from,
                          to: squareRepesentation,
                        },
                      })
                    );
                    setFrom(null);
                    setTo(null);
                  }
                }}
                key={colIndex}
                className={`w-16 h-16 flex items-center justify-center  ${
                  (rowIndex + colIndex) % 2 === 0
                    ? "bg-[#779556]"
                    : "bg-[#6b6b6b]"
                }`}
              >
                <div className="w-full h-full flex justify-center items-center ">
                  <div className="h-full justify-center flex flex-col">
                    {square ? (
                      <img className="w-4" 
                      src={`/${square.color === "b"? square?.type: `${square?.type?.toUpperCase()} copy`}.png`}/>) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
