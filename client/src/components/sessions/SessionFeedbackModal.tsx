import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Meh, Award, User as UserIcon } from "lucide-react";

interface SessionFeedbackModalProps {
  session: Session;
  participant: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackRating = "positive" | "neutral" | "negative";

export function SessionFeedbackModal({ 
  session, 
  participant, 
  open, 
  onOpenChange 
}: SessionFeedbackModalProps) {
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert rating to numeric value
  const getRatingValue = (rating: FeedbackRating): number => {
    switch (rating) {
      case "positive": return 5;
      case "neutral": return 3;
      case "negative": return 1;
      default: return 3;
    }
  };

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRating) return null;
      
      const response = await apiRequest("POST", "/api/session-reviews", {
        sessionId: session.id,
        reviewerId: participant.id,
        targetId: session.hostId, // Giving feedback to the host
        rating: getRatingValue(selectedRating),
        content: comment,
        isHostReview: false // Player reviewing host
      });
      
      return await response.json();
    },
    onSuccess: () => {
      // Update relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${session.hostId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${session.id}`] });
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting feedback",
        description: error.message || "There was an error submitting your feedback.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function handleSubmit() {
    if (!selectedRating) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting feedback.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    submitFeedbackMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 dark:bg-slateNight/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>How was your gaming session?</DialogTitle>
          <DialogDescription>
            Your feedback helps build our community reputation system and improves future sessions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.hostPhotoUrl || undefined} alt="Host" />
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session.title}</p>
              <p className="text-sm text-muted-foreground">Hosted by {session.hostName}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">How would you rate this session?</h4>
            <div className="flex justify-center space-x-8">
              <FeedbackButton 
                icon={<ThumbsUp className="h-6 w-6" />} 
                label="Great"
                selected={selectedRating === "positive"}
                onClick={() => setSelectedRating("positive")}
                colorClass="text-green-500"
              />
              
              <FeedbackButton 
                icon={<Meh className="h-6 w-6" />} 
                label="Okay"
                selected={selectedRating === "neutral"}
                onClick={() => setSelectedRating("neutral")}
                colorClass="text-amber-500"
              />
              
              <FeedbackButton 
                icon={<ThumbsDown className="h-6 w-6" />} 
                label="Poor"
                selected={selectedRating === "negative"}
                onClick={() => setSelectedRating("negative")}
                colorClass="text-red-500"
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Additional comments (optional)</h4>
            <Textarea
              placeholder="Share your thoughts about the session..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md flex items-start space-x-3">
            <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your feedback contributes to our community reputation system, helping 
              everyone find reliable and enjoyable gaming sessions.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRating}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FeedbackButtonProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
  colorClass: string;
}

function FeedbackButton({ icon, label, selected, onClick, colorClass }: FeedbackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-md transition-all ${
        selected 
          ? `bg-primary/10 ring-2 ring-primary ${colorClass}` 
          : "hover:bg-muted"
      }`}
    >
      <div className={selected ? colorClass : "text-muted-foreground"}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${selected ? colorClass : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
}