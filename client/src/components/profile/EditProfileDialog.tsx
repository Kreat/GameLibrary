import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import axios from "axios";
import { MapPin } from "lucide-react";
// Profile update schema
const profileSchema = z.object({
  displayName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  favoriteGames: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
      location: user.location || "",
      favoriteGames: user.favoriteGames || "",
      photoUrl: user.photoUrl || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      console.log("Submitting profile update with values:", values);
      const response = await apiRequest(
        "PATCH",
        `/api/users/${user.id}`,
        values
      );
      const data = await response.json();
      console.log("Profile update response:", data);
      return data;
    },
    onSuccess: (updatedUser) => {
      // Update the user in the cache
      queryClient.setQueryData([`/api/users/${user.id}`], updatedUser);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description:
          error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const apiKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        const results = response.data.results;
        const addressComponents = results[0]?.address_components;
        const cityComponent = addressComponents?.find((c: any) =>
          c.types.includes("locality")
        );
        const postalCodeComponent = addressComponents?.find((c: any) =>
          c.types.includes("postal_code")
        );

        if (cityComponent && postalCodeComponent) {
          const formattedLocation = `${cityComponent.long_name}, ${postalCodeComponent.long_name}`;
          form.setValue("location", formattedLocation);
          toast({
            title: "Location set",
            description: `Detected: ${formattedLocation}`,
          });
        } else {
          toast({
            title: "Location not found",
            description: "Could not detect your location.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch location data.",
          variant: "destructive",
        });
      }
    });
  };

  function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    updateProfileMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-background/95 dark:bg-slateNight/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your display name"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed to other users.
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
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your gaming interests, experience, or anything else
                    you'd like others to know.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Stanford, CA"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favoriteGames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite Games</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Catan, Chess, D&D"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the URL of your profile picture. Use services like
                    Imgur or similar to host your image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={handleUseMyLocation}
            >
              <MapPin size={16} /> Use My Location
            </Button>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
