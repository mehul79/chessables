import {WebSocketServer} from 'ws';
import { GameManager } from './GameManager';
import express from "express"
import dotenv from "dotenv"
import authRouter from './router/auth.router';

dotenv.config()
const app = express()
app.use(express.json())

app.use('/auth', authRouter);

app.listen(process.env.APP_PORT, ()=>{console.log(`Express server at port ${process.env.APP_PORT}`);
})



const wss = new WebSocketServer({port: Number(process.env.WS_PORT)});
console.log(`WS server at port ${process.env.WS_PORT}`);

const gameManager = new GameManager();
let userCount = 0;

wss.on("connection", function connection(ws, req){
  gameManager.addUser(ws);
  console.log(++userCount);
  

  ws.on("disconnect", function disconnect(){
    gameManager.removeUser(ws)
  })
})


