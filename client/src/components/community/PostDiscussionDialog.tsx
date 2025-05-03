import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Plus, Gamepad } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";

// Categories
const categories = [
  {
    id: "general",
    name: "General Discussion",
    description: "Talk about anything game-related",
    color: "bg-primary text-white"
  },
  {
    id: "board-games",
    name: "Board Games",
    description: "Strategy, eurogames, family games and more",
    color: "bg-amber-500 text-white"
  },
  {
    id: "card-games",
    name: "Card Games",
    description: "Collectible, trading, and traditional card games",
    color: "bg-accent text-white"
  },
  {
    id: "rpg",
    name: "Tabletop RPGs",
    description: "Role-playing games, campaigns, and GM resources",
    color: "bg-purple-800 text-white"
  },
  {
    id: "lfg",
    name: "Looking For Group",
    description: "Find players for your next gaming session",
    color: "bg-green-600 text-white"
  }
];

// Sample games (in a real app, these would come from the database)
const sampleGames = [
  { id: 1, title: "Catan", type: "board" },
  { id: 2, title: "Wingspan", type: "board" },
  { id: 3, title: "Magic: The Gathering", type: "card" },
  { id: 4, title: "Pokémon TCG", type: "card" },
  { id: 5, title: "Dungeons & Dragons", type: "rpg" },
  { id: 6, title: "Call of Cthulhu", type: "rpg" },
  { id: 7, title: "Warhammer 40k", type: "miniature" },
  { id: 8, title: "Ticket to Ride", type: "board" },
  { id: 9, title: "Pandemic", type: "board" },
  { id: 10, title: "Gloomhaven", type: "board" },
];

// Form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  gameId: z.string().optional(),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostDiscussionDialogProps {
  buttonClassNames?: string;
  buttonLabel?: React.ReactNode;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  refreshThreads?: () => void;
  asChild?: boolean;
}

export function PostDiscussionDialog({
  buttonClassNames = "",
  buttonLabel = (
    <>
      <MessageCircle className="mr-2 h-4 w-4" />
      New Discussion
    </>
  ),
  buttonVariant = "outline",
  buttonSize = "lg",
  children,
  refreshThreads,
  asChild
}: PostDiscussionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "general",
      gameId: "",
      content: "",
      tags: "",
    },
  });

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState && !user) {
      // Redirect to login if not logged in
      window.location.href = "/auth";
      return;
    }
    setOpen(newOpenState);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Create tags array from comma-separated string
      const tags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      
      // Mocked submission
      console.log("Submitted discussion:", { ...data, tags });
      
      // Success toast
      toast({
        title: "Discussion posted",
        description: "Your thread has been published to the community.",
        variant: "default",
      });
      
      // Close dialog and reset form
      setOpen(false);
      form.reset();
      
      // Refresh threads list if callback provided
      if (refreshThreads) {
        refreshThreads();
      }
    } catch (error) {
      console.error("Error posting discussion:", error);
      toast({
        title: "Error",
        description: "Failed to post your discussion. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild={asChild}>
        {children ? (
          children
        ) : (
          <Button 
            variant={buttonVariant} 
            size={buttonSize}
            className={buttonClassNames}
          >
            {buttonLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Start a Discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or find gaming partners in the community.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thread Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What would you like to discuss?" {...field} />
                  </FormControl>
                  <FormDescription>
                    Make your title clear and descriptive.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the most appropriate category for your discussion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gameId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Game (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No specific game</SelectItem>
                      {sampleGames.map((game) => (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          {game.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a game that your discussion is about.
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
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts, questions, or experiences..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="beginner-friendly, recommendations, local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate tags with commas to make your post more discoverable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Post Discussion
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}