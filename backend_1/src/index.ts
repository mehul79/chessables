import {WebSocketServer} from 'ws';
import { GameManager } from './GameManager';



const wss = new WebSocketServer({port: 8080});
const gameManager = new GameManager();
let userCount = 0;

wss.on("connection", function connection(ws){
  gameManager.addUser(ws);
  console.log(++userCount);
  
  
  ws.on("disconnect", function disconnect(){
    gameManager.removeUser(ws)
  })
})


