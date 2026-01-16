import LandingBtn from "@/components/LandingBtn"
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
        <button>
          <LandingBtn text="Resign" variant="red" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will end the game with you as the loser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResign}>Resign</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
