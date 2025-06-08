import { create } from "zustand";
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";

type GameStore = {
    started: boolean,
    setStarted: ()=>void,
    gameId: string,
    setGameId: (gameId: string) => void,
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
    updateUsername: (username: string)=> void,
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
            console.log(response);
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

    updateUsername: async(username: string) =>{
        try{
            console.log(username);
            const res = await axios.post(
            `${BACKEND_URL}/auth/settings`,
            { username: username },
            { withCredentials: true }
        );
        if(res.data.success){
            set({user: res.data.user})
        }
        console.log(res);
        }catch(e){
            console.log(e);
        }
    }
}));



const useGameStore = create<GameStore>((set)=> ({
    started: false,
    gameId: "",
    setStarted: ()=>{
        console.log("Game started");
        set({started: true})
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
    }
}))

export { useUserStore, useGameStore }