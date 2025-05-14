import ChessBoard from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import LandingBtn from "@/components/LandingBtn";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore } from "@/stores/game.store";

//remove code repetion using commons or monoRepo
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const {started, setStarted} = useGameStore();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("message", message);
      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          console.log("Game initialized");
          setStarted()
          break;
        case MOVE:
          const move = message.payload;
          console.log(move);
          chess.move(move);
          setBoard(chess.board());
          console.log("Move made", message);
          break;
        case GAME_OVER:
          console.log("Game over", message);
          break;
      }
    };
  }, [socket]);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  const handleOnPlay = () => {
    socket.send(JSON.stringify({ type: INIT_GAME }));
  };

  return (
    <div className="flex justify-center ">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 ">
          <div className="col-span-4  w-full flex justify-center ">
            <ChessBoard board={board} socket={socket}  />
          </div>
          <div className="col-span-2 bg-gray-900 flex justify-center pt-10 ">
            <div>
              <button onClick={handleOnPlay}>
                {started? "" : <LandingBtn text="Play" />} 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
