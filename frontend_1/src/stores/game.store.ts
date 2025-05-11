import { create } from "zustand";
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";

type GameStore = {
    started: boolean,
    setStarted: ()=>void,
}

type userSchema = {
    token: string,
    id: string,
    name: string
}

type UserStore = {
    user: userSchema | null,
    fetchUser: () => void,
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    fetchUser: async () => {
        try {
            console.log("inside the fetch functions");
            const response = await axios.get(`${BACKEND_URL}/auth/refresh`);
            const user: userSchema = response.data;
            set({ user });
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    },
}));


export const useGameStore = create<GameStore>((set)=> ({
    started: false,
    setStarted: ()=>{
        set({started: true})
    }
}))