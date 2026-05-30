import { useUserStore } from "@/stores/game.store";
import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

export function useSocket(){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { user } = useUserStore();

    useEffect(() => {
        if (!user?.token) return;

        const newSocket = new WebSocket(`${WS_URL}?token=${user.token}`);

        newSocket.onopen = () => { 
            console.log("WebSocket Connected");
            setSocket(newSocket);
        };

        newSocket.onclose = (event) => {
            console.log("WebSocket Disconnected", event.code, event.reason);
            setSocket(null);
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        return () => {
            if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
                newSocket.close();
            }
        };
    }, [user?.token]);

    return socket;
}


