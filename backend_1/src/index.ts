import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import express from "express";
import cors from "cors"; // Import the CORS middleware
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import authRouter from "./router/auth.router";
import { COOKIE_MAX_AGE } from "./utils/constants";
import { initPassport } from "./utils/passport";
import { extractAuthUser } from "./utils/auth";
import url from "url";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_SECRET || "mehul",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: COOKIE_MAX_AGE },
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/auth", authRouter);

app.listen(process.env.APP_PORT, () => {
  console.log(`Express server at port  ${process.env.APP_PORT}`);
});

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });
console.log(`WS server at port ${process.env.WS_PORT}`);

console.log("done");

const gameManager = new GameManager();
let userCount = 0;

wss.on("connection", function connection(ws, req) {
  //@ts-ignore
  const token: string = url.parse(req.url, true).query.token;
  const user = extractAuthUser(token, ws);
  gameManager.addUser(user);
  console.log(++userCount);
  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});


