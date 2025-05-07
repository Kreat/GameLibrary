import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSessionReviewSchema } from "@shared/schema";

interface SessionReviewFormProps {
  sessionId: number;
  targetId: number;
  targetName: string;
  isHost: boolean;
  onSuccess?: () => void;
}

// Extend the schema with validation
const reviewFormSchema = insertSessionReviewSchema.extend({
  rating: z.number().min(1).max(5),
  content: z.string().min(3, "Please provide feedback").max(500, "Feedback is too long"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const SessionReviewForm = ({ 
  sessionId, 
  targetId, 
  targetName, 
  isHost, 
  onSuccess 
}: SessionReviewFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      sessionId,
      targetId,
      rating: 5,
      content: "",
      isHostReview: isHost,
    },
  });
  
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await apiRequest("POST", "/api/session-reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: `You've successfully reviewed ${targetName}.`,
      });
      
      // Invalidate user stats cache to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/user-stats/${targetId}`] });
      
      // Invalidate leaderboard data
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/top-hosts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/top-players"] });
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.message || "Please try again later",
      });
    },
  });
  
  const handleSubmit = (values: ReviewFormValues) => {
    reviewMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">
            Rate {isHost ? `${targetName} as Host` : `${targetName} as Player`}
          </h3>
          <p className="text-sm text-muted-foreground">
            Your feedback helps build a better gaming community
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => field.onChange(rating)}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoveredRating ? rating <= hoveredRating : rating <= field.value)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormDescription className="text-center">
                {field.value === 1 && "Poor"}
                {field.value === 2 && "Below Average"}
                {field.value === 3 && "Average"}
                {field.value === 4 && "Good"}
                {field.value === 5 && "Excellent"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`What was your experience ${isHost ? "with this host" : "playing with this person"}?`}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide helpful feedback about your experience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-2">
          {onSuccess && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={reviewMutation.isPending}>
            {reviewMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Review
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SessionReviewForm;