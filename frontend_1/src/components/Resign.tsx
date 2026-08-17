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
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

export const RESIGN = "resign";

export default function Resign({
  gameId,
  socket,
}: {
  gameId: string;
  socket: WebSocket;
}) {
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
        <Button variant="outline" size="sm" className="bg-white/[0.03] text-white border-white/10 hover:border-white/30 hover:bg-white/10 transition-colors duration-200">
          <Flag className="w-4 h-4 mr-2" />
          Resign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-neutral-950 border-white/10 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_20px_60px_-15px_rgba(0,0,0,0.8)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Resign Game?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to resign? This will count as a loss.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResign}
            className="bg-white hover:bg-gray-200 text-black transition-colors duration-200"
          >
            Resign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
