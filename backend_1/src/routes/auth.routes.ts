import { NextFunction, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../utils/db";
import { COOKIE_MAX_AGE } from "../utils/contants";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_URL = process.env.AUTH_REDIRECT_URL;
const JWT_SECRET = process.env.JWT_SECRET || "mehul";

interface userJwtClaims {
  userId: string;
  name: string;
}

interface UserDetails {
  id: string;
  token?: string;
  name: string;
}

// Refresh token route
export const refresh = async (req: Request, res: Response) => {
  //@ts-ignore
  if (req.user) {
    //@ts-ignore
    const user = req.user as UserDetails;

    const userDb = await db.user.findFirst({
      where: { id: user.id },
    });

    const token = jwt.sign({ userId: user.id, name: userDb?.name }, JWT_SECRET);

    res.json({
      token,
      id: user.id,
      name: userDb?.name,
    });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// Failed login
export const loginFailed = async (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: "failure" });
};

// Logout
export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ error: "Failed to log out" });
    } else {
      res.clearCookie("jwt");
      res.json({
        msg: "logout successfull"
      })
    }
  });
};

// Google OAuth
export const google = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCB = passport.authenticate("google", {
  successRedirect: CLIENT_URL,
  failureRedirect: "/login/failed",
});

// GitHub OAuth
export const github = passport.authenticate("github", {
    scope: ["read:user", "user:email"],
  });

export const githubCB = passport.authenticate("github", {
  successRedirect: CLIENT_URL,
  failureRedirect: "/login/failed",
});
