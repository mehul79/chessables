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
import { Flag } from "lucide-react";

export const RESIGN = "resign";

export default function Resign({ gameId }: { gameId: string }) {
  const socket = useSocket();

  const handleResign = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: RESIGN,
        payload: { gameId },
      })
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-400 border-red-900/50 hover:border-red-500 hover:bg-red-950/30 transition-all duration-300">
          <Flag className="w-4 h-4 mr-2" />
          Resign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Resign Game?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to resign? This will count as a loss.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleResign}
            className="bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Resign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
