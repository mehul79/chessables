import {WebSocketServer} from 'ws';
import { GameManager } from './GameManager';
import express from  "express"
import cors from "cors"; // Import the CORS middleware
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import dotenv from "dotenv"
dotenv.config()


const app = express();
app.use(express.json())
app.all("/api/auth/*", toNodeHandler(auth));

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.listen(process.env.APP_PORT, ()=>{
  console.log(`App at Port: ${process.env.APP_PORT}`);
})

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




