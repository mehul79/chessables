import { Request, Response } from "express"
import express from "express"
import { getGame } from "../routes/game.routes";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("inside the game router and things are working here")
})

router.get("/:gameId", getGame)


export default router;