import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock, Users, MapPin } from "lucide-react";

const JoinSessionPage = () => {
  const [, params] = useRoute("/join/:id");
  const [_, navigate] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [joining, setJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  
  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!params || !params.id) {
        toast({
          title: "Invalid invitation",
          description: "The invitation link you followed is invalid.",
          variant: "destructive",
        });
        navigate("/sessions");
        return;
      }
      
      try {
        const sessionId = params.id;
        const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
        
        if (!sessionDoc.exists()) {
          toast({
            title: "Session not found",
            description: "The game session you're trying to join doesn't exist or may have been cancelled.",
            variant: "destructive",
          });
          navigate("/sessions");
          return;
        }
        
        const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
        setSession(sessionData);
        
        // Check if user is already a participant
        if (user && sessionData.participants) {
          const isParticipant = sessionData.participants.some(
            (participant: any) => participant.id === user.uid
          );
          setAlreadyJoined(isParticipant);
        }
        
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error loading session",
          description: "There was a problem retrieving the session details.",
          variant: "destructive",
        });
      } finally {
        setLoadingSession(false);
      }
    };
    
    if (!loading) {
      fetchSession();
    }
  }, [params, loading, user, navigate, toast]);
  
  // Handle join session
  const handleJoinSession = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join this session",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!session) return;
    
    setJoining(true);
    
    try {
      // Add user to participants array
      const sessionRef = doc(db, "sessions", session.id);
      await updateDoc(sessionRef, {
        participants: arrayUnion({
          id: user.uid,
          name: user.displayName || "Anonymous Player",
          avatar: user.photoURL || "",
        }),
      });
      
      setAlreadyJoined(true);
      
      toast({
        title: "Success!",
        description: "You've joined the game session.",
      });
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Failed to join",
        description: "There was a problem joining the session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };
  
  if (loadingSession) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold">Loading session details...</h2>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>
              The game session you're looking for doesn't exist or may have been cancelled.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/sessions")}>Browse Available Sessions</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Format date and time from Firestore Timestamp
  const sessionDate = session.startTime?.toDate ? 
    new Date(session.startTime.toDate()) : 
    new Date();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="bg-primary/10 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl lg:text-3xl mb-2">{session.title}</CardTitle>
              <CardDescription className="text-base">
                <span className="font-medium">{session.gameName}</span> ({session.gameType})
              </CardDescription>
            </div>
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {session.experienceLevel}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p>{formatDate(sessionDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Time</h3>
                  <p>{formatTime(sessionDate)} ({session.duration})</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{session.location}</p>
                  <p className="text-sm text-muted-foreground">{session.address}</p>
                  {session.locationNotes && (
                    <p className="text-sm italic mt-1">{session.locationNotes}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Players</h3>
                  <p>
                    {session.participants?.length || 1} / {session.maxParticipants} players
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="font-medium text-sm">Hosted by: {session.host?.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {session.participants?.map((participant: any, index: number) => (
                        <div key={index} className="flex items-center gap-1.5 text-sm bg-muted/50 px-2 py-1 rounded-full">
                          {participant.avatar ? (
                            <img 
                              src={participant.avatar} 
                              alt={participant.name} 
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {participant.name.charAt(0)}
                            </div>
                          )}
                          <span>{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-sm">{session.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border/50 pt-6">
          <Button variant="outline" onClick={() => navigate("/sessions")}>
            Browse All Sessions
          </Button>
          
          {alreadyJoined ? (
            <Button variant="secondary" onClick={() => navigate(`/sessions/${session.id}`)}>
              You've Joined This Session
            </Button>
          ) : (
            <Button onClick={handleJoinSession} disabled={joining}>
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join This Session"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSessionPage;