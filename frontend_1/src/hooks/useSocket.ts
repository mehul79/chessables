import { useUserStore } from "@/stores/game.store";
import { useEffect, useState } from "react";


const WS_URL = import.meta.env.VITE_WS_URL as string || "wss://be.chessables.allmehul.me/ws";

export function useSocket(){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const {user} = useUserStore()

    useEffect(() => {
        const newSocket = new WebSocket(`${WS_URL}?token=${user?.token}`);
        newSocket.onopen = () => { 
            console.log("connected");
          setSocket(newSocket);
          console.log("socket set" );
        };
        newSocket.onclose = () => {
            console.log("disconnected");
            setSocket(null);
        };
        return () => {
            newSocket.close();
        };
    }, []);

    return socket
}


