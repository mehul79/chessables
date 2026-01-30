import {Routes, Route} from "react-router-dom"
import Landing from "./screens/Landing";
import GameLobby from "./screens/GameLobby";
import GameRoom from "./screens/GameRoom";
import Login from "./screens/Login";
import { useUserStore } from "./stores/game.store";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Settings from "./screens/Settings";

function App(){

  const {user, fetchUser, isCheckingUser} = useUserStore()

  useEffect(()=>{
    fetchUser()
  }, [])

  if(isCheckingUser){
    return(
      <div className="flex justify-center items-center text-4xl bg-black text-white h-screen">
        Loading...
      </div>
    )
  }
  
  // if(isCheckingUser && !user){
  //   return(
  //     <div className="flex justify-center items-center text-4xl bg-black text-white h-screen">
  //       Loading...
  //     </div>
  //   )
  // }

  return(
    <div className="dark text-foreground bg-background h-screen ">
    <Toaster position="top-center" richColors />
    <Routes>
      <Route path="/" element={ <Landing /> } />
      <Route path="/login" element={<Login />} /> 
      <Route path="/game" element={user? <GameLobby /> : <Login />} />
      <Route path="/game/:gameId" element={user? <GameRoom /> : <Login />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
    </div>
  )
}

export default App;