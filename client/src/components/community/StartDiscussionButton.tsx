import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample forum categories
const categories = [
  { id: "general", name: "General Discussion" },
  { id: "gaming", name: "Gaming" },
  { id: "tabletop", name: "Tabletop RPGs" },
  { id: "boardgames", name: "Board Games" },
  { id: "videogames", name: "Video Games" },
  { id: "tournaments", name: "Tournaments & Events" },
  { id: "looking-for-group", name: "Looking for Group" },
];

// Sample games
const sampleGames = [
  { id: 1, title: "Dungeons & Dragons" },
  { id: 2, title: "Magic: The Gathering" },
  { id: 3, title: "Catan" },
  { id: 4, title: "Pandemic" },
  { id: 5, title: "Among Us" },
  { id: 6, title: "Valorant" },
  { id: 7, title: "Minecraft" },
];

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  category: z.string(),
  gameId: z.string().optional(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StartDiscussionButtonProps {
  refreshThreads?: () => void;
  className?: string;
}

export function StartDiscussionButton({ refreshThreads, className = "" }: StartDiscussionButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleClick = () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Create tags array from comma-separated string
      const tags = data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

      // Mocked submission
      console.log("Submitted discussion:", { ...data, tags });

      // Success toast
      toast({
        title: "Discussion posted",
        description: "Your thread has been published to the community.",
        variant: "default",
      });

      // Close dialog and reset form
      setDialogOpen(false);
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
    <>
      <Button
        variant="outline"
        size="lg"
        className={`border-primary-foreground/40 text-white hover:bg-primary-foreground/10 ${className}`}
        onClick={handleClick}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Start a Discussion
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    <FormDescription>Make your title clear and descriptive.</FormDescription>
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
                    <FormDescription>Select a game that your discussion is about.</FormDescription>
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
    </>
  );
}