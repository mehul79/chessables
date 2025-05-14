import { create } from "zustand";
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";

type GameStore = {
    started: boolean,
    setStarted: ()=>void,
}

export type userSchema = {
    token: string,
    id: string,
    name: string
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
            // console.log(response);
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
    }
}));



const useGameStore = create<GameStore>((set)=> ({
    started: false,
    setStarted: ()=>{
        set({started: true})
    }
}))

export { useUserStore, useGameStore }