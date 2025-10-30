import ChessBoard from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import LandingBtn from "@/components/LandingBtn";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore, useUserStore } from "@/stores/game.store";
import { ColorTag } from "@/components/Colortag";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Draw from "@/components/Draw";
import Resign from "@/components/Resign";
import Modal from "@/components/Modal";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_ENDED = "game_ended";
export const GAME_ALERT = "game_alert";
export const GAME_ADDED = "game_added";

const Game = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { started, setStarted, setGameId, setGameResult, gameResult, whitePlayer, setWhitePlayer, blackPlayer, setBlackPlayer, myColor, setMyColor } = useGameStore();
  const { user } = useUserStore();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [moves, setMoves] =  useState<any[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [whiteTime, setWhiteTime] = useState(600000);
  const [blackTime, setBlackTime] = useState(600000);

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
          setWhiteTime(600000);
          setBlackTime(600000);
          navigate(`/game/${gameId}`);
          
          const resolvedColor = whitePlayer?.name === user?.name ? "white" : "black";
          setMyColor(resolvedColor);
          console.log(resolvedColor);
          
          toast.success(`Game started! You are ${resolvedColor === "white" ? "White" : "Black"}`);
          
          break;

        case MOVE:
          const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
          
          if (move.after) {
            chess.load(move.after);
          } else {
            chess.move({ from: move.from, to: move.to });
          }
          
          setBoard(chess.board());
          setMoves(prev => [...prev, { 
            from: move.from, 
            to: move.to,
            san: move.san
          }]);

          setWhiteTime(600000 - player1TimeConsumed);
          setBlackTime(600000 - player2TimeConsumed);
          break;

        case GAME_ENDED:
          setGameResult(message.payload.result);
          setStarted();
          toast.info(`Game ended: ${message.payload.result}`);
          break;

        case GAME_ALERT:
          toast.warning(message.payload.message);
          break;
      }
    };
  }, [socket, chess, setStarted, setGameId]);

  useEffect(() => {
    if (!started || gameResult) return;

    const interval = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTime(prev => Math.max(0, prev - 1000));
      } else {
        setBlackTime(prev => Math.max(0, prev - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started, chess, gameResult]);


  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  
  const myName = user?.name || "You";
  const opponentName = myColor === "white" ? blackPlayer?.name : whitePlayer?.name;
  const opponentDisplayName = opponentName || "Opponent";
  const myTime = myColor === "white" ? whiteTime : blackTime;
  const opponentTime = myColor === "white" ? blackTime : whiteTime;
  const isMyTurn = (chess.turn() === 'w' && myColor === 'white') || (chess.turn() === 'b' && myColor === 'black');

  if (!socket) return <div className="flex items-center justify-center h-screen">Connecting...</div>;

  return (
    <>
      {gameResult && <Modal />}
      
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
              {myColor && <div className="flex items-center gap-2 mt-1">
                <ColorTag color={myColor} />
                <span className={`text-sm font-mono ${isMyTurn ? 'text-green-400' : 'text-gray-400'}`}>
                  {formatTime(myTime)}
                </span>
              </div>}
            </div>
          </div>

          {started && <div className="text-xl font-bold text-gray-500">VS</div>}

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white font-semibold">{opponentDisplayName}</div>
              {myColor && <div className="flex items-center gap-2 mt-1 justify-end">
                <ColorTag color={myColor === "white" ? "black" : "white"} />
                <span className={`text-sm font-mono ${!isMyTurn ? 'text-green-400' : 'text-gray-400'}`}>
                  {formatTime(opponentTime)}
                </span>
              </div>}
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
            <ChessBoard board={board} socket={socket} chess={chess} />
            <div className="flex flex-col gap-3 ml-1">
              <Draw />
              <Resign />
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-4 ">
            
            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-bold mb-3">Controls</h3>
              
              {gameResult ? (
                <div className="space-y-2">
                  <div className="p-3 rounded bg-yellow-900/30 border border-yellow-600/50">
                    <p className="text-yellow-400 text-sm text-center font-semibold">Game Ended</p>
                    <p className="text-white text-xs text-center mt-1">{gameResult}</p>
                  </div>
                  <button onClick={() => socket.send(JSON.stringify({ type: INIT_GAME }))} className="w-full">
                    <LandingBtn text="New Game" />
                  </button>
                </div>
              ) : isWaiting ? (
                <div className="p-3 rounded bg-blue-900/30 border border-blue-600/50">
                  <p className="text-blue-400 text-sm text-center">Waiting for opponent...</p>
                  <div className="flex justify-center mt-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  </div>
                </div>
              ) : !started ? (
                <button onClick={() => socket.send(JSON.stringify({ type: INIT_GAME }))} className="w-full">
                  <LandingBtn text="Start Game" />
                </button>
              ) : (
                <div className="space-y-2">
                  <div className={`p-2 rounded ${isMyTurn ? 'bg-green-900/30 border border-green-600/50' : 'bg-gray-900/30'}`}>
                    <p className={`text-sm text-center ${isMyTurn ? 'text-green-400' : 'text-gray-400'}`}>
                      {isMyTurn ? 'Your Turn' : 'Opponent\'s Turn'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Moves */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-bold mb-3">Moves</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {moves.length === 0 ? (
                  <p className="text-gray-500 text-sm">No moves yet</p>
                ) : (
                  Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
                    const white = moves[i * 2];
                    const black = moves[i * 2 + 1];
                    return (
                      <div key={i} className="flex gap-2 text-sm bg-gray-900/50 p-2 rounded">
                        <span className="text-gray-500">{i + 1}.</span>
                        <span className="text-white font-mono">{white.san || `${white.from}-${white.to}`}</span>
                        {black && <span className="text-white font-mono">{black.san || `${black.from}-${black.to}`}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Game;
