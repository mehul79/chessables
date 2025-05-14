import { useUserStore } from "@/stores/game.store";
import { useEffect, useState } from "react";


const WS_URL = 'ws://localhost:8080'

export function useSocket(){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const {user} = useUserStore()

    useEffect(() => {
        const newSocket = new WebSocket(`${WS_URL}?token=${user?.token}`);
        newSocket.onopen = () => { 
            console.log("connected");
            setSocket(newSocket);
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