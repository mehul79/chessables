import { WebSocket } from "ws";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'mehul'

export interface useJWTClaims {
    userId: string;
    name: string;
}


export function extractUser(token: string, ws: WebSocket){
    const decoded = jwt.verify(token, JWT_SECRET) as useJWTClaims;
    return decoded.userId
}