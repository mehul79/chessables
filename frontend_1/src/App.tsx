import {Routes, Route} from "react-router-dom"
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import Login from "./screens/Login";
import { useUserStore } from "./stores/game.store";
import { useEffect } from "react";
import Settings from "./screens/Settings";

function App(){

  const {user, fetchUser, isCheckingUser} = useUserStore()

  useEffect(()=>{
    fetchUser()
  }, [])

  if(isCheckingUser && !user){
    return(
      <div className="flex justify-center items-center text-4xl bg-black text-white h-screen">
        Loading...
      </div>
    )
  }

  return(
    <div className="dark text-foreground bg-background h-screen ">
    <Routes>
      <Route path="/" element={ <Landing /> } />
      <Route path="/login" element={<Login />} /> 
      <Route path="/game" element={user? <Game /> : <Login />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    </div>
  )
}

export default App;