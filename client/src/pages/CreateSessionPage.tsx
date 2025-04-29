import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { z } from "zod";
import SessionWizard from "@/components/home/SessionWizard";

const CreateSessionPage = () => {
  const [_, navigate] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

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
      
      toast({
        title: "Session created!",
        description: "Your gaming session has been successfully created.",
      });
      
      navigate(`/sessions/${docRef.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Failed to create session",
        description: "An error occurred while creating your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pb-12">
      {/* SessionWizard has all the form handling logic */}
      <SessionWizard onSessionCreated={createSession} />
    </div>
  );
};

export default CreateSessionPage;
