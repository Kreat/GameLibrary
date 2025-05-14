import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, Info, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface HostEligibilityCheckProps {
  onEligibilityDetermined: (isEligible: boolean) => void;
  showDialog?: boolean;
}

export function HostEligibilityCheck({ 
  onEligibilityDetermined, 
  showDialog = true 
}: HostEligibilityCheckProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  interface UserStats {
    sessionsJoined: number;
    sessionsHosted: number;
    reliability: number;
    // Other potential stats fields
    [key: string]: any;
  }
  
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
  });
  
  const sessionsJoined = userStats?.sessionsJoined || 0;
  const requiredSessions = 2; // Number of sessions required before hosting
  const isEligible = sessionsJoined >= requiredSessions;
  const progressPercentage = Math.min((sessionsJoined / requiredSessions) * 100, 100);
  
  useEffect(() => {
    if (!isLoading) {
      onEligibilityDetermined(isEligible);
      
      if (!isEligible && showDialog) {
        setDialogOpen(true);
      }
    }
  }, [isEligible, isLoading, onEligibilityDetermined, showDialog]);
  
  function handleClose() {
    setDialogOpen(false);
    
    if (!isEligible) {
      toast({
        title: "Hosting requirement",
        description: "Join more game sessions before you can host your own.",
      });
    }
  }
  
  if (isLoading) {
    return null;
  }
  
  if (!showDialog) {
    // If we're just checking eligibility without dialog, return null
    return null;
  }
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 dark:bg-slateNight/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Hosting Requirement
          </DialogTitle>
          <DialogDescription>
            Our community norm requires players to attend a few sessions before hosting their own.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Experience Requirement</CardTitle>
              <CardDescription>
                Host your own session after attending {requiredSessions} game sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your progress</span>
                  <span className="font-medium">{sessionsJoined} / {requiredSessions} sessions</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="mt-4 bg-muted/50 rounded-md p-3 text-sm text-muted-foreground flex gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Attending sessions first helps you:</p>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      <li>Learn how good hosts organize games</li>
                      <li>Understand community expectations</li>
                      <li>Build your reputation in the community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-muted p-4 rounded-md flex items-start space-x-3">
            {isEligible ? (
              <>
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-500">You're eligible to host!</h4>
                  <p className="text-sm text-muted-foreground">
                    Thanks for being an active member of our gaming community.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-500">Almost there!</h4>
                  <p className="text-sm text-muted-foreground">
                    You need to join {requiredSessions - sessionsJoined} more {requiredSessions - sessionsJoined === 1 ? 'session' : 'sessions'} before you can host.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose}>
            {isEligible ? "Continue" : "Browse Sessions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}