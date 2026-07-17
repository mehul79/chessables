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
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Connecting...
      </div>
    );

  return (
    <>
      <div className="h-screen w-full bg-black overflow-hidden">
        <div className="w-full h-full flex flex-col gap-5 px-6 py-6 lg:px-12 lg:py-8">
          {/* Players */}
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_32px_-12px_rgba(0,0,0,0.7)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
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
              <div className="text-xs font-semibold tracking-widest text-gray-600">
                VS
              </div>
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
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
                {opponentDisplayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
            {/* Board */}
            <div className="lg:flex-1 bg-white/[0.03] rounded-2xl p-6 border border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_32px_-12px_rgba(0,0,0,0.7)] flex items-center justify-center">
              <ChessBoard board={board} socket={socket} chess={chess} gameId={"fdsfs"} isMyTurn={false} />
            </div>
            {/* Sidebar */}
            <div className="flex flex-col gap-5 lg:w-80 shrink-0">
              {/* Controls */}
              <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_32px_-12px_rgba(0,0,0,0.7)]">
                <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
                  Controls
                </h3>

                {isWaiting ? (
                  <div className="p-3 rounded-xl bg-white/[0.06] border border-white/10">
                    <p className="text-white text-sm text-center">
                      Waiting for opponent...
                    </p>
                    <div className="flex justify-center mt-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      socket.send(JSON.stringify({ type: INIT_GAME }))
                    }
                    className="w-full"
                  >
                    <LandingBtn text="Start Game" variant="green" />
                  </button>
                )}
              </div>

              {/* Moves */}
              <div className="flex-1 bg-white/[0.03] rounded-2xl p-5 border border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_32px_-12px_rgba(0,0,0,0.7)] min-h-0">
                <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
                  Moves
                </h3>
                <p className="text-gray-500 text-sm">No moves yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameLobby;
