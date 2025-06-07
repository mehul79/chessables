import {WebSocketServer} from 'ws';
import { GameManager } from './GameManager';
import express from  "express"
import cors from "cors"; // Import the CORS middleware
import cookieParser from 'cookie-parser';
import { auth } from "./auth";
import dotenv from "dotenv"
import session from 'express-session';
import passport from 'passport';
import authRouter from './router/auth.router';
import { COOKIE_MAX_AGE } from './utils/constants';
import { initPassport } from './utils/passport';
import url from 'url';
dotenv.config()


const app = express();
app.use(express.json())
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

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
  })
);

app.use('/auth', authRouter);
app.listen(process.env.APP_PORT, ()=>{console.log(`Express server at port  ${process.env.APP_PORT}`)})

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

console.log('done');




