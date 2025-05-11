import { TextAnimate } from "@/components/magicui/text-animate";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/game.store";

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:3000";


const Login = () => {
  const {user, fetchUser } = useUserStore();

  const google = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  };

  const github = () => {
    window.open(`${BACKEND_URL}/auth/github`, "_self");
    fetchUser();
  };

  return (
    <div className="">
      <div className="h-screen flex justify-center flex-col items-center ">
        <h1 className="text-4xl font-extrabold mb-10">
            <TextAnimate animation="fadeIn" by="word">
                Enter the game world
            </TextAnimate>
        </h1>
        <div className="flex  gap-5">
          <Button variant="outline" className="" onClick={google}>
            <img src="google.svg" alt="" className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
          <Button variant="outline" className="" onClick={github}>
            <img src="github.svg" alt="" className="w-4 h-4 mr-2" />
            Login with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
