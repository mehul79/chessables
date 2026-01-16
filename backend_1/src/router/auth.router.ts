import express, { Request, Response } from "express";
import {   google, googleCB, loginFailed, logout, refresh } from "../routes/auth.routes";

const router = express.Router();

router.get("/", (req:Request, res:Response)=>{
    res.send("inside the auth router and things are working here")
})

router.get("/refresh", refresh)
router.get("/login/failed", loginFailed)
router.get("/logout", logout)
router.get("/google", google)
router.get("/google/callback", googleCB)

export default router




