import express, { Request, Response } from "express";
import {   google, googleCB, loginFailed, logout, refresh, settings } from "../routes/auth.routes";
import passport from "passport";

const router = express.Router();
const requireAuth = passport.authenticate('session');

router.get("/", (req:Request, res:Response)=>{
    res.send("inside the auth router and things are working here")
})
router.get("/refresh", refresh)
router.post("/settings", requireAuth, settings)
router.get("/login/failed", loginFailed)
router.get("/logout", logout)
router.get("/google", google)
router.get("/google/callback", googleCB)

export default router




