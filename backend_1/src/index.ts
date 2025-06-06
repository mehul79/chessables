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
<<<<<<< HEAD
app.use(cookieParser())
app.use(session({
    secret: process.env.COOKIE_SECRET || 'mehul',
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: false, maxAge: COOKIE_MAX_AGE },
}))

initPassport();
app.use(passport.initialize());
// app.use(passport.authenticate('session'));
app.use(passport.session());

const allowedHosts = process.env.ALLOWED_HOSTS? process.env.ALLOWED_HOSTS.split(','): [];
=======
app.all("/api/auth/*", toNodeHandler(auth));
>>>>>>> 6178d5348c8520e1ea30c1f4c31f3c4493c18c79

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

<<<<<<< HEAD
app.use('/auth', authRouter);
app.listen(process.env.APP_PORT, ()=>{console.log(`Express server at port  ${process.env.APP_PORT}`)})



=======
app.listen(process.env.APP_PORT, ()=>{
  console.log(`App at Port: ${process.env.APP_PORT}`);
})
>>>>>>> 6178d5348c8520e1ea30c1f4c31f3c4493c18c79

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




