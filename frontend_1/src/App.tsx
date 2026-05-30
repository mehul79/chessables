import {Routes, Route} from "react-router-dom"
import Landing from "./screens/Landing";
import GameLobby from "./screens/GameLobby";
import GameRoom from "./screens/GameRoom";
import Login from "./screens/Login";
import { useUserStore } from "./stores/game.store";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Settings from "./screens/Settings";
import { Button } from "./components/ui/button";
import { RefreshCcw, AlertCircle } from "lucide-react";

function App(){

  const {user, fetchUser, isCheckingUser, isBackendDown} = useUserStore()

  useEffect(()=>{
    fetchUser()
  }, [])


  
  if(isCheckingUser){
    return(
      <div className="flex flex-col justify-center items-center bg-black text-white h-screen space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-medium animate-pulse text-gray-400">
          Checking login state...
        </div>
      </div>
    )
  }

  if (isBackendDown && !user) {
    return (
      <div className="flex flex-col justify-center items-center bg-black text-white h-screen p-6 text-center">
        <div className="bg-red-900/20 p-6 rounded-2xl border border-red-900/50 max-w-sm space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Connection Error</h1>
            <p className="text-gray-400">
              We're having trouble connecting to the server. The backend might be offline or your connection is unstable.
            </p>
          </div>
          <Button 
            onClick={() => fetchUser()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

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