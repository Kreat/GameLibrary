import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock, MapPin, Users, Link, Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  gameType: z.string({
    required_error: "Please select a game type.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please select a time.",
  }),
  duration: z.string({
    required_error: "Please select a duration.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  maxParticipants: z.string().transform(val => parseInt(val)),
  experienceLevel: z.enum(["Any", "Beginner", "Intermediate", "Advanced"]),
  isRecurring: z.enum(["yes", "no"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSessionDialogProps {
  buttonClassNames?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  id?: string;
}

export function CreateSessionDialog({
  buttonClassNames = "",
  buttonLabel = "Host a Game",
  buttonVariant = "default",
  buttonSize = "default",
  children,
  id,
}: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      gameType: "",
      date: new Date(),
      time: "18:00",
      duration: "2 hours",
      location: "",
      maxParticipants: "4",
      experienceLevel: "Any",
      isRecurring: "no",
    },
  });
  
  async function onSubmit(data: FormValues) {
    console.log(data);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to host a game",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Combine date and time
      const dateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      // Create session object
      const gameSession = {
        title: data.title,
        description: data.description,
        gameType: data.gameType,
        startTime: dateTime,
        duration: data.duration,
        location: data.location,
        experienceLevel: data.experienceLevel,
        isRecurring: data.isRecurring === "yes",
        host: {
          id: user.uid || "guest",
          name: user.displayName || "Unknown Host",
          avatar: user.photoURL || ""
        },
        participants: [
          {
            id: user.uid || "guest",
            name: user.displayName || "Unknown Host",
            avatar: user.photoURL || ""
          }
        ],
        maxParticipants: data.maxParticipants,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add session to mock Firestore
      const docRef = await db.collection("sessions").add(gameSession);
      
      // Generate invitation link
      const sessionLink = `${window.location.origin}/join/${docRef.id}`;
      setInviteLink(sessionLink);
      
      toast({
        title: "Session created!",
        description: "Your game session has been scheduled.",
      });
      
      setOpen(false);
      setInviteDialogOpen(true);
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Failed to create session",
        description: "There was an error creating your session. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleOpenChange = (openState: boolean) => {
    if (openState && !user) {
      // If dialog is attempting to open but user isn't logged in
      setLocation("/auth");
      return;
    }
    setOpen(openState);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link copied!",
      description: "Invitation link has been copied to clipboard.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button 
              variant={buttonVariant} 
              size={buttonSize}
              className={buttonClassNames}
              id={id}
            >
              {buttonLabel}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Host Your Own Game Session</DialogTitle>
            <DialogDescription>
              Fill out the details below to create your game session. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Game Night: Catan Tournament" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your session a catchy title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Join us for a fun night of strategic gameplay with Catan and expansions!"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what players can expect from the session.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a game type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Board Game">Board Game</SelectItem>
                          <SelectItem value="Card Game">Card Game</SelectItem>
                          <SelectItem value="Tabletop RPG">Tabletop RPG</SelectItem>
                          <SelectItem value="Miniature Game">Miniature Game</SelectItem>
                          <SelectItem value="Party Game">Party Game</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Any" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Any Level
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Beginner" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Beginner Friendly
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Intermediate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Intermediate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Advanced" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Advanced Players
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setDatePickerOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="3 hours">3 hours</SelectItem>
                          <SelectItem value="4 hours">4 hours</SelectItem>
                          <SelectItem value="All day">All day</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Recurring Event?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              One-time event
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Weekly recurring
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Game Store Downtown, Online, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select maximum players" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 players</SelectItem>
                          <SelectItem value="3">3 players</SelectItem>
                          <SelectItem value="4">4 players</SelectItem>
                          <SelectItem value="5">5 players</SelectItem>
                          <SelectItem value="6">6 players</SelectItem>
                          <SelectItem value="8">8 players</SelectItem>
                          <SelectItem value="10">10 players</SelectItem>
                          <SelectItem value="12">12 players</SelectItem>
                          <SelectItem value="16">16+ players</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save Session</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Share Your Game Session</AlertDialogTitle>
            <AlertDialogDescription>
              Your game has been created! Share this link with friends to invite them to join your session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-between p-3 mt-2 bg-muted rounded-md">
            <div className="truncate flex-1 mr-2 text-sm overflow-hidden text-ellipsis">{inviteLink}</div>
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={() => setLocation("/sessions")}>
                View All Sessions
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}