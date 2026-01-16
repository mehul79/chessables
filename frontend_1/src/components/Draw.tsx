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
        <button>
          <LandingBtn text="Draw" variant="yellow" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Offer a Draw?</AlertDialogTitle>
          <AlertDialogDescription>
            This will end the game in a draw. Both players will receive half points.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDraw}>Offer Draw</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
