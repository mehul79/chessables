import {Routes, Route} from "react-router-dom"
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import Login from "./screens/Login";

function App(){
  return(
    <div className="dark text-foreground bg-background h-screen ">
    <Routes>
      
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/game" element={<Game />} />
    </Routes>
    </div>
  )
}

export default App;