import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import { parse } from "pg-connection-string";
import passport from "passport";
import authRouter from "./router/auth.router";
import gameRouter from "./router/game.router";
import { COOKIE_MAX_AGE } from "./utils/constants";
import { initPassport } from "./utils/passport";
import { extractAuthUser } from "./utils/auth";
import url from "url";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
const isProduction = process.env.NODE_ENV === "production";

const connectionConfig = parse(process.env.DATABASE_URL || "");
const pgPool = new Pool({
  user: connectionConfig.user,
  password: connectionConfig.password,
  host: connectionConfig.host || undefined,
  database: connectionConfig.database || undefined,
  port: connectionConfig.port ? parseInt(connectionConfig.port) : undefined,
  ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : false,
});

const PgStore = pgSession(session);

app.use(
  session({
    store: new PgStore({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
      httpOnly: true,  
      secure: isProduction, 
      maxAge: COOKIE_MAX_AGE, 
      sameSite: isProduction ? "none" : "lax" 
    },
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["https://chessables.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/game", gameRouter)

app.get("/", (req, res) => {
  res.send("Server has started at 3000 we are at / route right now hi sexy")
})

app.get("/debug", (req, res) => {
  res.json({
    secure: req.secure,
    protocol: req.protocol,
    cookie: req.headers.cookie ?? null,
  });
});

const PORT = process.env.PORT || process.env.APP_PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();
let userCount = 0;

wss.on("connection", function connection(ws, req) {
  console.log("New WS connection attempt");
  try {
    const parsedUrl = url.parse(req.url || "", true);
    const token = parsedUrl.query.token as string;

    if (!token) {
      console.error("No token provided in WS connection");
      ws.close(1008, "Token required");
      return;
    }

    const user = extractAuthUser(token, ws);
    gameManager.addUser(user);
    console.log(`User connected: ${user.name} (${user.userId}). Total users: ${++userCount}`);

    ws.on("close", () => {
      gameManager.removeUser(ws);
      console.log(`User disconnected. Total users: ${--userCount}`);
    });

    ws.on("error", (err) => {
      console.error("WS error:", err);
    });

  } catch (e) {
    console.error("WS connection error:", e);
    ws.close(1011, "Internal server error during connection");
  }
});
