import { Request, Response } from "express";
import { Chess } from "chess.js";
import db from "../utils/db";

/**
 * GET /api/game/:gameId
 * Fully rehydrates a game for frontend persistence
 */
 
export const getGame = async (req: Request, res: Response) => {
  
  //auth
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized hahahahaha",
      });
      return;
    }

    const user = req.user as { id: string };

    const userDb = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true },
    });

    if (!userDb) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // 2️⃣ PARAM VALIDATION
    const gameId  = req.params.gameId;

    if (!gameId) {
      res.status(400).json({
        success: false,
        message: "Invalid gameId",
      });
      return;
    }

    
    // 3️⃣ FETCH GAME + RELATIONS
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        whitePlayer: {
          select: { id: true, name: true },
        },
        blackPlayer: {
          select: { id: true, name: true },
        },
        moves: {
          orderBy: { moveNumber: "asc" },
          select: {
            moveNumber: true,
            from: true,
            to: true,
            san: true,
            timeTaken: true,
            createdAt: true,
          },
        },
      },
    });

    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }


    // 5️⃣ COMPUTE TIME CONSUMED
    let player1TimeConsumed = 0;
    let player2TimeConsumed = 0;

    game?.moves.forEach((move, index) => {
      if (!move.timeTaken) return;
      if (index % 2 === 0) {
        player1TimeConsumed += move.timeTaken;
      } else {
        player2TimeConsumed += move.timeTaken;
      }
    });

    let lastMoveTime
    if (game) {
      // 6️⃣ LAST MOVE TIME
      lastMoveTime =
        game.moves.length > 0
          ? game.moves[game.moves.length - 1].createdAt
          : game.startAt;
    }
    
    

    // 7️⃣ TURN FROM FEN
    //@ts-ignore
    const chess = new Chess(game.currentFen);
    const turn = chess.turn(); // 'w' | 'b'

    // 8️⃣ DETERMINE MY COLOR
    const myColor = game?.whitePlayer.id === userDb.id ? "white" : "black";

    // 9️⃣ SEND SNAPSHOT RESPONSE
    res.status(200).json({
      gameId: game?.id,
      status: game?.status,
      result: game?.result,

      players: {
        white: game?.whitePlayer,
        black: game?.blackPlayer,
      },

      myColor,

      board: {
        currentFen: game?.currentFen,
        turn,
      },

      time: {
        totalTimeMs: 10 * 60 * 1000, // 10 minutes
        player1TimeConsumed,
        player2TimeConsumed,
        lastMoveTime,
      },

      moves: game?.moves.map((m) => ({
        moveNumber: m.moveNumber,
        from: m.from,
        to: m.to,
        san: m.san,
      })),
    });
  } catch (error) {
    console.error("GET /api/game/:gameId error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

