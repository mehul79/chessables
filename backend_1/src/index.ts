import {WebSocketServer} from 'ws';
import { GameManager } from './GameManager';
import dotenv from "dotenv"
dotenv.config()



const wss = new WebSocketServer({port: Number(process.env.WS_PORT)});
console.log(`WS server at port ${process.env.WS_PORT}`);

const gameManager = new GameManager();
let userCount = 0;

wss.on("connection",  function connection(ws, req){
  gameManager.addUser(ws);
  console.log(++userCount);
  ws.on("disconnect", function disconnect(){
    gameManager.removeUser(ws)
  })
})


