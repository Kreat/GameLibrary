import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star } from "lucide-react";

// Form validation schema
const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  content: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type SessionReviewFormProps = {
  sessionId: number;
  targetUser: {
    id: number;
    username: string;
    displayName: string | null;
  };
  isHost: boolean; // Is the target user a host or a player
  onSuccess?: () => void;
};

export default function SessionReviewForm({ 
  sessionId, 
  targetUser, 
  isHost,
  onSuccess
}: SessionReviewFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      content: "",
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const response = await apiRequest("POST", "/api/session-reviews", {
        sessionId,
        targetId: targetUser.id,
        rating: values.rating,
        content: values.content || null,
        isHostReview: isHost,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${targetUser.id}/stats`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats/top"] });
      
      toast({
        title: "Review submitted",
        description: `You've successfully reviewed ${targetUser.displayName || targetUser.username}`,
      });
      
      form.reset();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ReviewFormValues) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit reviews",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Rate {isHost ? "Host" : "Player"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Rate {isHost ? "Host" : "Player"}: {targetUser.displayName || targetUser.username}
          </DialogTitle>
          <DialogDescription>
            Share your experience with this {isHost ? "host" : "player"} to help others find reliable gaming partners.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value.toString()}
                      onValueChange={field.onChange}
                      className="flex space-x-2"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-1">
                          <RadioGroupItem
                            value={value.toString()}
                            id={`rating-${value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`rating-${value}`}
                            className="cursor-pointer flex flex-col items-center space-y-1 peer-data-[state=checked]:text-yellow-500"
                          >
                            <Star className="h-8 w-8 peer-data-[state=checked]:fill-yellow-500" />
                            <span className="text-xs font-medium">{value}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {isHost 
                      ? "Rate how well the host organized and ran the game session." 
                      : "Rate this player's participation and contributions to the game."}
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
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Share your thoughts about this ${
                        isHost ? "host" : "player"
                      }...`}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your feedback helps build a better gaming community.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}