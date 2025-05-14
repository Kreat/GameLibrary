import { useState } from "react";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Info, 
  ShieldAlert, 
  Star, 
  X 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Session } from "@shared/schema";
import { formatDistanceToNow, isBefore, subHours } from "date-fns";

interface CancellationPolicyDialogProps {
  session: Session;
  isHost: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: () => void;
}

export function CancellationPolicyDialog({ 
  session, 
  isHost, 
  open, 
  onOpenChange, 
  onConfirmCancel 
}: CancellationPolicyDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Calculate if we're within the cancellation penalty window
  const now = new Date();
  const sessionStart = new Date(session.startTime);
  const playerDeadline = subHours(sessionStart, 72); // 72 hours before session
  const hostDeadline = subHours(sessionStart, 24); // 24 hours before session
  
  const playerPenalty = !isHost && isBefore(playerDeadline, now);
  const hostPenalty = isHost && isBefore(hostDeadline, now);
  const hasPenalty = playerPenalty || hostPenalty;
  
  const penaltyText = isHost 
    ? "Cancelling within 24 hours of the session will affect your host reputation score."
    : "Cancelling within 72 hours of the session will count as a no-show in your attendance record.";

  function handleConfirmCancel() {
    setIsConfirming(true);
    onConfirmCancel();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 dark:bg-slateNight/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {isHost ? "Cancel Your Session" : "Leave This Session"}
          </DialogTitle>
          <DialogDescription>
            {isHost 
              ? "Are you sure you want to cancel this session? This will notify all participants."
              : "Are you sure you want to leave this session? The host will be notified."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-md flex items-start space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Session Details</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{session.title}</span> starting in {formatDistanceToNow(sessionStart)}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.minPlayers}-{session.maxPlayers} players • {session.experienceLevel} level
              </p>
            </div>
          </div>
          
          {hasPenalty && (
            <div className="bg-amber-500/10 dark:bg-amber-700/10 p-4 rounded-md flex items-start space-x-3 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-amber-500">Cancellation Policy</h4>
                <p className="text-sm text-muted-foreground">
                  {penaltyText}
                </p>
                <div className="flex items-center mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Info className="h-4 w-4 mr-1" />
                          <span className="text-xs">Why?</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          {isHost 
                            ? "We value player schedules! Last-minute cancellations by hosts are disruptive to players who have reserved time for your session."
                            : "We value reliability! Last-minute cancellations leave empty spots that could have been filled by other players."
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
          
          {!hasPenalty && (
            <div className="bg-green-500/10 dark:bg-green-700/10 p-4 rounded-md flex items-start space-x-3 border border-green-500/20">
              <Star className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-green-500">No Penalty</h4>
                <p className="text-sm text-muted-foreground">
                  You're cancelling with plenty of advance notice. There will be no impact on your reputation score.
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-muted/50 p-3 rounded-md flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Our community guidelines encourage reliability and respect for other players' time.
              <a href="/docs/norms.md" target="_blank" className="text-primary hover:underline ml-1">
                Read the full community norms
              </a>
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Keep Session
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <span className="flex items-center">
                Processing<span className="loading ml-2">...</span>
              </span>
            ) : (
              isHost ? "Cancel Session" : "Leave Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}