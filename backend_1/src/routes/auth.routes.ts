import { NextFunction, Request, Response } from "express";
import passport, { use } from "passport";
import jwt from "jsonwebtoken";
import db from "../utils/db";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_URL = process.env.ALLOWED_HOSTS;
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
  if (req.user) {
    const user = req.user as UserDetails;
    const userDb = await db.user.findFirst({
      where: { id: user.id },
    });
    
    if (!userDb) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }else{
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }

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
      return res.status(500).json({ error: "Failed to log out" });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Error destroying session:", destroyErr);
        return res.status(500).json({ error: "Failed to destroy session" });
      }

      res.clearCookie("connect.sid"); // Important: clear the session cookie
      res.json({ msg: "Logout successful" });
    });
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
