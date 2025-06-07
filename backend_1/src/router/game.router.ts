import express from 'express';
import { getGame, getGames, createGame, updateGame, deleteGame } from '../routes/game.routes';
const router = express.Router();

router.get('/game/:id', getGame);
router.get('/games', getGames);
router.post('/game/create', createGame);
router.post('/game/update', updateGame);
router.delete('/game/delete/:id', deleteGame);
// router.get('/game/:id', getGame);    