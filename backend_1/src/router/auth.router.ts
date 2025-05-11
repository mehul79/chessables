import express from "express";
import {  github, githubCB, google, googleCB, loginFailed, refresh } from "../routes/auth.routes";
const router = express.Router();


router.get("/refresh", refresh)
router.get("/login/failed", loginFailed)
router.get("/google", google)
router.get("/google/callback", googleCB)
router.get("/github", github)
router.get("/github/callback", githubCB)

export default router




