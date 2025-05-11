import LandingBtn from "@/components/LandingBtn";
import { TextAnimate } from "@/components/magicui/text-animate";
import { useUserStore } from "@/stores/game.store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Landing = () => {

  const {user, fetchUser} = useUserStore()
  useEffect(()=>{
    fetchUser()
  }, [])

  const navigator = useNavigate();
  
  const handleOnPlay = () => {
    navigator("/game");
  };

  const handleLogin = () =>{
    navigator("/login");
  };



  return (
    <div id="root" className="grid grid-cols-2 gap-4 ">
      <div className="h-screen flex items-center">
        <img src="/Landing.png" className="mask-t-from-50% pl-4" />
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        {/* <h1 className="text-5xl font-extrabold">Number #2 best chess site.</h1> */}
        <div>user: {JSON.stringify(user)}</div>
        <h1 className="text-4xl font-extrabold">
        <TextAnimate animation="slideLeft" by="character">
          Number #2 best chess site.
        </TextAnimate>
        </h1>
        <div className="flex gap-5">
          <button onClick={handleLogin}>
            <LandingBtn text="Login"  /> 
            </button>
          <button onClick={handleOnPlay}>
            <LandingBtn text="Play Game" variant="green" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
