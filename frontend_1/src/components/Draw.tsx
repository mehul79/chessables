import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";


export const DRAW_OFFER = "draw_offer";

export default function Draw({ gameId }: { gameId: string }) {
  const socket = useSocket();

  const handleDraw = () => {
    if (socket && gameId) {
      socket.send(JSON.stringify({
        type: DRAW_OFFER,
        payload: { gameId }
      }));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-yellow-500 hover:text-yellow-400 border-yellow-900/50 hover:border-yellow-500 hover:bg-yellow-950/30 transition-all duration-300">
          <Handshake className="w-4 h-4 mr-2" />
          Offer Draw
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Offer a Draw?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will send a draw offer to your opponent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDraw}
            className="bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
          >
            Offer Draw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
