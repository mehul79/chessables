import { useGameStore } from "@/stores/game.store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Home, Play, Swords } from "lucide-react";

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
        if (gameResult === "DRAW") return <Swords className="w-16 h-16 text-blue-400" />;
        return <Trophy className="w-16 h-16 text-yellow-400" />;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-6">
                    <div className="flex justify-center animate-bounce">
                        {getIcon()}
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {getResultText()}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            The game has concluded. Well played!
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 pt-4">
                        <Button
                            onClick={() => navigate("/game")}
                            variant="default"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            New Match
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline"
                            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-11 transition-all"
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
