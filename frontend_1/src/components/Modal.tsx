import { useGameStore } from "@/stores/game.store";
import { useNavigate } from "react-router-dom";
import strategy from "../../public/strategy.png";

export default function Modal() {
    const { gameResult } = useGameStore();
    const navigate = useNavigate();

    const getResultText = () => {
        if (gameResult === "WHITE_WINS") return "White Wins!";
        if (gameResult === "BLACK_WINS") return "Black Wins!";
        if (gameResult === "DRAW") return "Draw!";
        return "Game Over";
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-yellow-400 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <img src={strategy} alt="strategy" className="w-32 h-32 object-contain" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900">
                        {getResultText()}
                    </h1>
                    
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
