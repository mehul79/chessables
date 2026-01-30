import { create } from "zustand";
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";

type Player = {
    name: string;
}

type GameStore = {
    started: boolean,
    setStarted: ()=>void,
    gameId: string,
    setGameId: (gameId: string) => void,
    gameResult: GAME_RESULT,
    setGameResult: (game_result: GAME_RESULT) => void,
    whitePlayer: Player,
    setWhitePlayer: (player: Player) => void,
    blackPlayer: Player,
    setBlackPlayer: (player: Player) => void,
    myColor: "white" | "black" | undefined,
    setMyColor: (color: "white" | "black") => void,
}

export type userSchema = {
    token: string,
    id: string,
    name: string,
    username?: string 
}

type UserStore = {
    user: userSchema | null,
    isCheckingUser: boolean,
    fetchUser: () => void,
    logout: () => void,
}

const useUserStore = create<UserStore>((set) => ({
    user: null,
    isCheckingUser: false,
    fetchUser: async () => {
        try {
            set({isCheckingUser: true})
            // console.log("inside the fetch functions");
            const response = await axios.get(`${BACKEND_URL}/auth/refresh`, {
                withCredentials: true
            });
            // console.log("haha: ", response);
            const user: userSchema = response.data;
            set({ user: user });
            set({isCheckingUser: false})
        } catch (error) {
            set({isCheckingUser: false})
            console.error("Failed to fetch user:", error);
        }
    },

    logout: async () => {
        try{
            set({isCheckingUser: true})
            console.log("inside logout");
            const response = await axios.get(`${BACKEND_URL}/auth/logout`, {
                withCredentials: true
            });
            console.log("call done");
            console.log(response);
            set({user: null})
            set({isCheckingUser: false})
        }catch(e){
            console.error("Error while loggin out: ", e)
        }
    },
}));

type GAME_RESULT = "WHITE_WINS" | "BLACK_WINS" | "DRAW" ;

const useGameStore = create<GameStore>((set)=> ({
    started: false,
    gameId: "",
    gameResult: "" as GAME_RESULT,
    whitePlayer: { name: "" },
    blackPlayer: { name: "" },
    myColor: undefined,
    
    setStarted: ()=>{
        console.log("Game started");
        set({started: true})
    },
    
    setWhitePlayer: (player: Player) => {
        set({ whitePlayer: player });
    },
    
    setBlackPlayer: (player: Player) => {
        set({ blackPlayer: player });
    },
    
    setMyColor: (color: "white" | "black") => {
        set({ myColor: color });
    },
    updateDB: async (gameId: string, moves: string[]) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/game/update`, {
                gameId: gameId,
                moves: moves
            }, {
                withCredentials: true
            });
            console.log("Game updated successfully:", response.data);
        } catch (error) {
            console.error("Error updating game:", error);
        }
    },

    setGameId: (gameId: string) => {
        console.log("Game ID set to:", gameId);
        set({ gameId: gameId });
    },

    setGameResult: (game_result: GAME_RESULT) => {
        console.log("Game result set to:", game_result);
        set({ gameResult: game_result });
    }

}))

export { useUserStore, useGameStore }