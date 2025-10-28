import LandingBtn, { Variant } from "@/components/LandingBtn";
import { TextAnimate } from "@/components/magicui/text-animate";
import { useUserStore } from "@/stores/game.store";
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"


const Landing = () => {
  const { user,  logout } = useUserStore();
  const navigator = useNavigate()

  const handleOnPlay = async() => {
    if(!user){
      alert("Please login to play the game")
      return
    }
    navigator("/game")
  };

  const handleLogin = () => {
    navigator("/login");
  };

  const handleLogout = () =>{
    logout()
  }

  return (
    <div id="root" className="grid grid-cols-2 gap-4 ">
      <div className="h-screen flex items-center">
        <img src="/Landing.png" className="mask-t-from-50% pl-4" />
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        <h1 className="text-4xl font-extrabold">
          <TextAnimate animation="slideLeft" by="character">
            Number #2 best chess site.
          </TextAnimate>
        </h1>
        <div className="flex gap-5">
            {user ? (
            <Buttoner text="Logout" onclick={handleLogout} variant="red" />
            ) : (
            <Buttoner text="Login" onclick={handleLogin} />
            )}
          <Buttoner text="Play Game" onclick={handleOnPlay} variant="green" />
        </div>
      </div>
    </div>
  );
};

interface ButtonerProps {
  text: string;
  onclick: () => void;
  variant?: Variant | undefined 
}

const Buttoner: React.FC<ButtonerProps> = ({ text, onclick, variant }) => {
  return (
    <div>
      <button onClick={onclick}>
        <LandingBtn text={text} variant={variant} />
      </button>
    </div>
  );
};

export default Landing;
