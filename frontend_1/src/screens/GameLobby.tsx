import ChessBoard from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import LandingBtn from "@/components/LandingBtn";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore, useUserStore } from "@/stores/game.store";
import { ColorTag } from "@/components/Colortag";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_ENDED = "game_ended";
export const GAME_ALERT = "game_alert";
export const GAME_ADDED = "game_added";

const GameLobby = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const {
    started,
    setStarted,
    setGameId,
    setWhitePlayer,
    setBlackPlayer,
    myColor,
  } = useGameStore();
  const { user } = useUserStore();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case GAME_ADDED:
          setIsWaiting(true);
          toast.info("Waiting for opponent...");
          break;

        case INIT_GAME:
          const { gameId, whitePlayer, blackPlayer } = message.payload;
          console.log(message.payload);
          setWhitePlayer(whitePlayer);
          setBlackPlayer(blackPlayer);
          setGameId(gameId);
          setBoard(chess.board());
          setStarted();
          setIsWaiting(false);
          navigate(`/game/${gameId}`);
      }
    };
  }, [socket, chess, setStarted, setGameId]);

  const myName = user?.name || "You";
  const opponentDisplayName = "Opponent";

  if (!socket)
    return (
      <div className="flex items-center justify-center h-screen">
        Connecting...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Players */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {myName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-semibold">{myName}</div>
                {myColor && (
                  <div className="flex items-center gap-2 mt-1">
                    <ColorTag color={myColor} />
                  </div>
                )}
              </div>
            </div>

            {started && (
              <div className="text-xl font-bold text-gray-500">VS</div>
            )}

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white font-semibold">
                  {opponentDisplayName}
                </div>
                {myColor && (
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <ColorTag color={myColor === "white" ? "black" : "white"} />
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                {opponentDisplayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Board */}
            <div className="lg:col-span-3 bg-gray-800 rounded-lg p-4 border border-gray-700 flex justify-between">
              <ChessBoard board={board} socket={socket} chess={chess} gameId={"fdsfs"} isMyTurn={false} /> 
            </div>
            {/* Sidebar */}
            <div className="space-y-4 ">
              {/* Controls */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-bold mb-3">Controls</h3>

                {isWaiting ? (
                  <div className="p-3 rounded bg-blue-900/30 border border-blue-600/50">
                    <p className="text-blue-400 text-sm text-center">
                      Waiting for opponent...
                    </p>
                    <div className="flex justify-center mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      socket.send(JSON.stringify({ type: INIT_GAME }))
                    }
                    className="w-full"
                  >
                    <LandingBtn text="Start Game" />
                  </button>
                )}
              </div>

              {/* Moves */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-bold mb-3">Moves</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameLobby;
