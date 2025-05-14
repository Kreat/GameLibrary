import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, UserPlus, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Profile completion schema with required fields
const profileCompletionSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
  pronouns: z.string().min(1, { message: "Please select your pronouns" }),
  timeZone: z.string().min(1, { message: "Please select your time zone" }),
  favoriteGames: z.string().min(3, { message: "Please list some of your favorite games" }),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type ProfileCompletionValues = z.infer<typeof profileCompletionSchema>;

interface ProfileCompletionWizardProps {
  user: User;
  open: boolean;
  onComplete: () => void;
}

export function ProfileCompletionWizard({ user, open, onComplete }: ProfileCompletionWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ProfileCompletionValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      displayName: user.displayName || "",
      pronouns: "",
      timeZone: "",
      favoriteGames: user.favoriteGames || "",
      bio: user.bio || "",
      location: user.location || "",
    },
    mode: "onChange",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;
  
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileCompletionValues) => {
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, values);
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([`/api/users/${user.id}`], updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been completed successfully.",
      });
      
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error completing your profile.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: ProfileCompletionValues) {
    setIsSubmitting(true);
    updateProfileMutation.mutate(values);
  }

  function nextStep() {
    // Validate the current step fields
    if (step === 1) {
      form.trigger("displayName").then(isValid => {
        if (isValid) setStep(prev => prev + 1);
      });
    } else if (step === 2) {
      form.trigger(["pronouns", "timeZone"]).then(isValid => {
        if (isValid) setStep(prev => prev + 1);
      });
    }
  }

  function prevStep() {
    setStep(prev => Math.max(prev - 1, 1));
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 dark:bg-slateNight/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please provide the following information to complete your profile. 
            This helps build community trust and is required before hosting or joining game sessions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-xs text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm">Your display name is how others will identify you in the community.</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="How you want to be known" {...field} />
                      </FormControl>
                      <FormDescription>
                        This name will be visible to other users.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell others a bit about yourself..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description about yourself and your gaming interests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pronouns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pronouns*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your pronouns" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="he/him">he/him</SelectItem>
                          <SelectItem value="she/her">she/her</SelectItem>
                          <SelectItem value="they/them">they/them</SelectItem>
                          <SelectItem value="other">Other/Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your preferred pronouns help others address you correctly.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your time zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                          <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your time zone helps coordinate gaming sessions across different regions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State/Province, Country" {...field} />
                      </FormControl>
                      <FormDescription>
                        General location to help find local gaming groups.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="favoriteGames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Games*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List your favorite games, separated by commas..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share the games you enjoy most to connect with like-minded players.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="rounded-md bg-green-500/10 p-4 mt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-500">Ready to finish</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>
                          You're almost done! By completing your profile, you'll make a better 
                          impression on other players and be able to host and join game sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex items-center justify-between pt-4 space-x-2">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              ) : (
                <div></div> // Empty div to maintain layout with flex-justify-between
              )}
              
              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}