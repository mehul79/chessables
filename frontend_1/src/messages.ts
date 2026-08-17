// Mirrors backend_1/src/messages.ts. Lives on its own so leaf components can
// import message names without importing a screen (ChessBoard <-> GameLobby was
// a require cycle).
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const JOIN_GAME = "join_game";
export const GAME_ENDED = "game_ended";
export const GAME_ALERT = "game_alert";
export const GAME_ADDED = "game_added";
export const RESIGN = "resign";
