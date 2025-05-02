import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import SessionWizard from "@/components/home/SessionWizard";

const CreateSessionPage = () => {
  const [_, navigate] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a session",
        variant: "destructive",
      });
      navigate("/profile");
    }
  }, [user, loading, navigate, toast]);

  // SEO - Set document title
  useEffect(() => {
    document.title = "Create Session - GameHub";
  }, []);

  const createSession = async (sessionData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a session",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    try {
      // Prepare session data with timestamps and host info
      const startDateTime = new Date(
        `${sessionData.date.toISOString().split("T")[0]}T${sessionData.startTime.split(":")[0]}:00:00`
      );
      
      const endDateTime = new Date(
        `${sessionData.date.toISOString().split("T")[0]}T${sessionData.endTime.split(":")[0]}:00:00`
      );
      
      // If end time is before start time, assume it's the next day
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const gameSession = {
        title: sessionData.title,
        gameType: sessionData.gameType,
        gameName: sessionData.gameName,
        description: sessionData.description,
        minPlayers: parseInt(sessionData.minPlayers),
        maxPlayers: parseInt(sessionData.maxPlayers),
        experienceLevel: sessionData.experienceLevel,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        duration: `${(endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)} hours`,
        recurring: sessionData.recurring,
        location: sessionData.location,
        address: sessionData.address,
        locationNotes: sessionData.locationNotes,
        host: {
          id: user.uid,
          name: user.displayName || "Unknown Host",
          email: user.email,
          photoURL: user.photoURL || "",
        },
        participants: [
          {
            id: user.uid,
            name: user.displayName || "Unknown Host",
            avatar: user.photoURL || "",
          }
        ],
        maxParticipants: parseInt(sessionData.maxPlayers),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add session to Firestore
      const docRef = await addDoc(collection(db, "sessions"), gameSession);
      
      // Generate invitation link for the session
      const sessionLink = `${window.location.origin}/join/${docRef.id}`;
      setSessionId(docRef.id);
      setInviteLink(sessionLink);
      setInviteDialogOpen(true);
      
      toast({
        title: "Session created!",
        description: "Your gaming session has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Failed to create session",
        description: "An error occurred while creating your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "Game invitation link copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast({
        title: "Copy failed",
        description: "Please try copying the link manually",
        variant: "destructive",
      });
    }
  };
  
  const handleDialogClose = () => {
    setInviteDialogOpen(false);
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  return (
    <div className="pb-12">
      {/* SessionWizard has all the form handling logic */}
      <SessionWizard onSessionCreated={createSession} />
      
      {/* Invitation Link Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Game Session</DialogTitle>
            <DialogDescription>
              Share this invitation link with the players you want to invite to your game session
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={inviteLink}
                  readOnly
                />
              </div>
            </div>
            <Button 
              size="icon" 
              onClick={handleCopyLink}
              className="px-3"
            >
              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-start mt-4">
            <div className="text-xs text-muted-foreground">
              People with this link can request to join your game session
            </div>
            <div className="flex-1"></div>
            <Button onClick={handleDialogClose}>
              Go to Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateSessionPage;
