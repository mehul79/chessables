import { useGameStore } from "@/stores/game.store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingBtn from "@/components/LandingBtn";
import { Home, Trophy, Swords } from "lucide-react";

export default function Modal() {
    const { gameResult } = useGameStore();
    const navigate = useNavigate();

    const getResultText = () => {
        if (gameResult === "WHITE_WINS") return "White Wins!";
        if (gameResult === "BLACK_WINS") return "Black Wins!";
        if (gameResult === "DRAW") return "It's a Draw!";
        return "Game Over";
    };

    const getIcon = () => {
        if (gameResult === "DRAW") return <Swords className="w-16 h-16 text-white" />;
        return <Trophy className="w-16 h-16 text-white" />;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_20px_60px_-15px_rgba(0,0,0,0.8)] max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300 ease-out">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="flex justify-center">
                        {getIcon()}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {getResultText()}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            The game has concluded. Well played!
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 w-full">
                        <button onClick={() => navigate("/game")} className="w-full">
                            <LandingBtn text="New Match" />
                        </button>
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline"
                            className="w-full border-white/20 text-gray-300 hover:bg-white/10 hover:text-white h-11 transition-all"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
