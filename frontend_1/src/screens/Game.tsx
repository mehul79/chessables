import ChessBoard from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import LandingBtn from "@/components/LandingBtn";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore, useUserStore } from "@/stores/game.store";
import { ColorTag } from "@/components/Colortag";
import { HyperText } from "@/components/magicui/hyper-text";

//remove code repetion using commons or monoRepo
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [color, setColor] = useState("")
  const [board, setBoard] = useState(chess.board());
  const {started, setStarted} = useGameStore();
  const {  user } = useUserStore();

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
          setColor(message.playload.color);
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
      <div className="flex justify-center">
        <div className="bg-blue-300 h-screen w-50 absolute left-0 top-0">
          <div className="text-2xl font-bold text-center pt-4">
            Chessables
          </div>
        </div>
        <div className="pt-10 max-w-screen-lg w-full ">
            <div className="mb-4 bg-gray-900 pt-3 ml-20 flex items-center justify-between" >
              <div className="flex items-center ml-4">
                <div className="pb-2 pl-3">
                  <HyperText className="text-sm inline">username: </HyperText> 
                  <HyperText className="text-sm inline">{(user?.username || "Guest")}</HyperText>  
                </div>
                {started && (
                  <div className="pb-2 pl-3 ">
                    color: <ColorTag color={color === "white" ? "white" : "black"} />
                  </div>
                )}
              </div>
              <div className="bg-gray-600 h-7 w-0.5 relative bottom-1.5" />
              <div className="flex items-center mr-9">
                <div className="pb-2 pl-3">
                  <HyperText className="text-sm inline">username: </HyperText> 
                  <HyperText className="text-sm inline">{(user?.username || "Guest")}</HyperText>
                </div>
              </div>
            </div>
          <div className="grid grid-cols-6 gap-4 ">
            <div className="col-span-4  w-full flex justify-center">
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
