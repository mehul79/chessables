import { create } from "zustand";


type GameStore = {
    started: boolean,
    setStarted: ()=>void,
}

export const useGameStore = create<GameStore>((set)=> ({
    started: false,
    setStarted: ()=>{
        set({started: true})
    }
}))