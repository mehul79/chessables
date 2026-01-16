import ChessBoard from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore, useUserStore } from "@/stores/game.store";
import { ColorTag } from "@/components/Colortag";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import Resign from "@/components/Resign";
import Modal from "@/components/Modal";
import axios from "axios";
import LandingBtn from "@/components/LandingBtn";

export const MOVE = "move";
export const GAME_ENDED = "game_ended";
export const GAME_ALERT = "game_alert";
export const JOIN_GAME = "join_game";

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";
const TOTAL_TIME_MS = 10 * 60 * 1000;

const GameRoom = () => {
  const socket = useSocket();
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useUserStore();
  const {
    setWhitePlayer,
    setBlackPlayer,
    setMyColor,
    setGameResult,
    gameResult,
    whitePlayer,
    blackPlayer,
    myColor,
  } = useGameStore();

  // --------------------
  // CORE GAME STATE (hydrated from backend)
  // --------------------

  // chess.js instance must live in a ref (never recreate it)
  const chessRef = useRef<Chess | null>(null);

  // Board is DERIVED from chess.js, but stored as state for React rendering
  const [board, setBoard] = useState<any[][]>([]);

  // Move list (purely for UI)
  const [moves, setMoves] = useState<any[]>([]);

  // Game status from backend (IN_PROGRESS / COMPLETED)
  const [status, setStatus] = useState<string | null>(null);

  // Backend-authoritative time tracking
  const [player1TimeConsumed, setP1] = useState(0);
  const [player2TimeConsumed, setP2] = useState(0);

  // Timestamp of the last move (from backend, NOT frontend Date.now)
  const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now());

  // Whether HTTP hydration has completed
  const [hydrated, setHydrated] = useState(false);

  // Dummy state used ONLY to force re-render every second (for clocks)
  const [tick, forceRender] = useState(0);

  // --------------------
  // 1️⃣ FORCE RERENDER EVERY SECOND (for clocks)
  // --------------------
  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((v) => v + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --------------------
  // 2️⃣ HTTP HYDRATION (single source of truth)
  // --------------------
  useEffect(() => {
    if (!gameId) return;

    (async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/game/${gameId}`, {
          withCredentials: true,
        });

        const data = res.data;

        // Create chess.js from backend FEN
        const chess = new Chess(data.board.currentFen);
        chessRef.current = chess;

        // IMPORTANT: clone board array to force React re-render
        setBoard(chess.board().map((row) => [...row]));

        setMoves(data.moves);
        setStatus(data.status);
        setGameResult(data.result ?? null);

        setWhitePlayer(data.players.white);
        setBlackPlayer(data.players.black);
        setMyColor(data.myColor);

        setP1(data.time.player1TimeConsumed);
        setP2(data.time.player2TimeConsumed);

        // Use BACKEND timestamp, not Date.now()
        // setLastMoveTime(new Date(data.time.lastMoveTime).getTime());

        const ts = Number(data.time.lastMoveTime);
        setLastMoveTime(Number.isFinite(ts) ? ts : Date.now());
        
        setHydrated(true);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load game");
      }
    })();
  }, [gameId]);

  // 3️⃣ JOIN WEBSOCKET ROOM (live updates only)
  useEffect(() => {
    if (!socket || !hydrated || !gameId) return;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: JOIN_GAME,
          payload: { gameId },
        }),
      );
    } else {
      socket.addEventListener("open", () => {
        socket.send(
          JSON.stringify({
            type: JOIN_GAME,
            payload: { gameId },
          }),
        );
      });
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case MOVE: {
          const {
            move,
            player1TimeConsumed,
            player2TimeConsumed,
            moveTimestamp,
          } = message.payload;

          const chess = chessRef.current!;
          chess.load(move.after);

          // IMPORTANT: clone board array to force React update
          setBoard(chess.board().map((row) => [...row]));

          setMoves((prev) => [...prev, move]);

          setP1(player1TimeConsumed);
          setP2(player2TimeConsumed);

          // Use backend timestamp
          const ts = Number(moveTimestamp);
            setLastMoveTime(Number.isFinite(ts) ? ts : Date.now());
          
            // ✅ THIS WAS MISSING
            setStatus("IN_PROGRESS");
          
          break;
        }

        case GAME_ENDED:
          setGameResult(message.payload.result);
          setStatus(message.payload.status);
          toast.info(`Game ended: ${message.payload.result}`);
          break;

        case GAME_ALERT:
          toast.warning(message.payload.message);
          break;
      }
    };
  }, [socket, hydrated, gameId]);

  // 4️⃣ DERIVED CLOCKS (NO local ticking)
  const chess = chessRef.current;

  const whiteRemaining = useMemo(() => {
    if (!chess) return TOTAL_TIME_MS;
    const now = Date.now();
    let t = player1TimeConsumed;
  
    if (chess.turn() === "w" && status === "IN_PROGRESS") {
      t += now - lastMoveTime;
    }
  
    return Math.max(0, TOTAL_TIME_MS - t);
  }, [tick, player1TimeConsumed, lastMoveTime, chess, status]);
  
  const blackRemaining = useMemo(() => {
    if (!chess) return TOTAL_TIME_MS;
    const now = Date.now();
    let t = player2TimeConsumed;
  
    if (chess.turn() === "b" && status === "IN_PROGRESS") {
      t += now - lastMoveTime;
    }
  
    return Math.max(0, TOTAL_TIME_MS - t);
  }, [tick, player2TimeConsumed, lastMoveTime, chess, status]);

  const isMyTurn =
    chess &&
    status === "IN_PROGRESS" &&
    ((chess.turn() === "w" && myColor === "white") ||
      (chess.turn() === "b" && myColor === "black"));

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (!hydrated || !chessRef.current) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading game…
      </div>
    );
  }

  const myName = user?.name || "You";
  const opponentName = myColor === "white" ? blackPlayer?.name : whitePlayer?.name;
  const opponentDisplayName = opponentName || "Opponent";
  const myTime = myColor === "white" ? whiteRemaining : blackRemaining;
  const opponentTime = myColor === "white" ? blackRemaining : whiteRemaining;

  if (!socket)
    return (
      <div className="flex items-center justify-center h-screen">
        Connecting...
      </div>
    );

  // --------------------
  // ⚠️ RETURN PART BELOW IS UNCHANGED
  // --------------------
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
                {myColor && (
                  <div className="flex items-center gap-2 mt-1">
                    <ColorTag color={myColor} />
                    <span
                      className={`text-sm font-mono ${
                        isMyTurn ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {formatTime(myTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xl font-bold text-gray-500">VS</div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white font-semibold">
                  {opponentDisplayName}
                </div>
                {myColor && (
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <ColorTag color={myColor === "white" ? "black" : "white"} />
                    <span
                      className={`text-sm font-mono ${
                        !isMyTurn ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {formatTime(opponentTime)}
                    </span>
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
              {chessRef.current && (
                <ChessBoard
                  board={board}
                  socket={socket}
                  chess={chessRef.current}
                  gameId={gameId}
                  isMyTurn={isMyTurn}
                />
              )}

              <div className="flex flex-col gap-3 ml-1">
                <Resign gameId={gameId} />
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
                      <p className="text-yellow-400 text-sm text-center font-semibold">
                        Game Ended
                      </p>
                      <p className="text-white text-xs text-center mt-1">
                        {gameResult}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        socket.send(JSON.stringify({ type: "init_game" }))
                      }
                      className="w-full"
                    >
                      <LandingBtn text="New Game" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div
                      className={`p-2 rounded ${
                        isMyTurn
                          ? "bg-green-900/30 border border-green-600/50"
                          : "bg-gray-900/30"
                      }`}
                    >
                      <p
                        className={`text-sm text-center ${
                          isMyTurn ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {isMyTurn ? "Your Turn" : "Opponent's Turn"}
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
                    Array.from(
                      { length: Math.ceil(moves.length / 2) },
                      (_, i) => {
                        const white = moves[i * 2];
                        const black = moves[i * 2 + 1];
                        return (
                          <div
                            key={i}
                            className="flex gap-2 text-sm bg-gray-900/50 p-2 rounded"
                          >
                            <span className="text-gray-500">{i + 1}.</span>
                            <span className="text-white font-mono">
                              {white.san || `${white.from}-${white.to}`}
                            </span>
                            {black && (
                              <span className="text-white font-mono">
                                {black.san || `${black.from}-${black.to}`}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )
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

export default GameRoom;
