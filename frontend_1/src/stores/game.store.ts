import { create } from "zustand";


type GameStore = {
    started: boolean,
    loggedIn: boolean,
    setStarted: ()=>void,
}

export const useGameStore = create<GameStore>((set)=> ({
    started: false,
    loggedIn: false,
    setStarted: ()=>{
        set({started: true})
    },
    setLogged: ()=>{
        set({loggedIn: true})
    }
}))