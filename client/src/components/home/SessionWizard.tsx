import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const stepOneSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  gameType: z.string().min(1, { message: "Please select a game type" }),
  gameName: z.string().min(1, { message: "Please enter a game name" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  minPlayers: z.string().min(1, { message: "Please select minimum players" }),
  maxPlayers: z.string().min(1, { message: "Please select maximum players" }),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"])
});

type StepOneValues = z.infer<typeof stepOneSchema>;

const stepTwoSchema = z.object({
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string().min(1, { message: "Please select a start time" }),
  endTime: z.string().min(1, { message: "Please select an end time" }),
  recurring: z.enum(["once", "weekly", "biweekly", "monthly"]),
});

type StepTwoValues = z.infer<typeof stepTwoSchema>;

const stepThreeSchema = z.object({
  location: z.string().min(1, { message: "Please enter a location" }),
  address: z.string().min(1, { message: "Please enter an address" }),
  locationNotes: z.string().optional(),
});

type StepThreeValues = z.infer<typeof stepThreeSchema>;

const SessionWizard = () => {
  const [step, setStep] = useState(1);
  
  const stepOneForm = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      title: "",
      gameType: "",
      gameName: "",
      description: "",
      minPlayers: "2",
      maxPlayers: "4",
      experienceLevel: "beginner"
    }
  });
  
  const stepTwoForm = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      date: undefined,
      startTime: "",
      endTime: "",
      recurring: "once"
    }
  });
  
  const stepThreeForm = useForm<StepThreeValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      location: "",
      address: "",
      locationNotes: ""
    }
  });
  
  const onStepOneSubmit = (data: StepOneValues) => {
    console.log("Step 1 data:", data);
    setStep(2);
  };
  
  const onStepTwoSubmit = (data: StepTwoValues) => {
    console.log("Step 2 data:", data);
    setStep(3);
  };
  
  const onStepThreeSubmit = (data: StepThreeValues) => {
    console.log("Step 3 data:", data);
    
    // Combine all form data
    const sessionData = {
      ...stepOneForm.getValues(),
      ...stepTwoForm.getValues(),
      ...data
    };
    
    console.log("Complete session data:", sessionData);
    
    // Here you would submit to your API
    alert("Session created successfully! (Demo only)");
  };
  
  return (
    <section className="py-12 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary-200/50 dark:bg-primary-900/20 rounded-full -mr-24 -mt-24"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full -ml-16 -mb-16"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 md:p-8 bg-primary text-white">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Host Your Own Game Session</h2>
            <p className="text-primary-foreground/80">Create a new gaming event and find players to join</p>
          </div>
          
          {/* Session Creation Wizard */}
          <div className="p-6 md:p-8">
            {/* Steps */}
            <div className="flex mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 ${step >= 1 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"} text-white rounded-full flex items-center justify-center font-medium text-sm`}>1</div>
                  <span className={`text-xs mt-2 font-medium ${step >= 1 ? "text-primary dark:text-primary-foreground" : "text-gray-500 dark:text-gray-400"}`}>Game Details</span>
                </div>
              </div>
              <div className="w-12 flex items-center justify-center">
                <div className={`w-full h-0.5 ${step >= 2 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}></div>
              </div>
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 ${step >= 2 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"} text-white rounded-full flex items-center justify-center font-medium text-sm`}>2</div>
                  <span className={`text-xs mt-2 font-medium ${step >= 2 ? "text-primary dark:text-primary-foreground" : "text-gray-500 dark:text-gray-400"}`}>Schedule</span>
                </div>
              </div>
              <div className="w-12 flex items-center justify-center">
                <div className={`w-full h-0.5 ${step >= 3 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}></div>
              </div>
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 ${step >= 3 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"} text-white rounded-full flex items-center justify-center font-medium text-sm`}>3</div>
                  <span className={`text-xs mt-2 font-medium ${step >= 3 ? "text-primary dark:text-primary-foreground" : "text-gray-500 dark:text-gray-400"}`}>Location</span>
                </div>
              </div>
            </div>
            
            {/* Step 1: Game Details Form */}
            {step === 1 && (
              <Form {...stepOneForm}>
                <form onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)} className="space-y-6">
                  <FormField
                    control={stepOneForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a catchy title for your session" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stepOneForm.control}
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
                            <SelectItem value="Miniature Wargame">Miniature Wargame</SelectItem>
                            <SelectItem value="Party Game">Party Game</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stepOneForm.control}
                    name="gameName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Catan, Magic: The Gathering, D&D 5e" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stepOneForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share details about your session, experience level needed, what to bring, etc." 
                            rows={3} 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={stepOneForm.control}
                      name="minPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Players</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Min players" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stepOneForm.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Players</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Max players" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={stepOneForm.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Experience Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div>
                              <RadioGroupItem
                                value="beginner"
                                id="beginner"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="beginner"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Beginner
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="intermediate"
                                id="intermediate"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="intermediate"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Intermediate
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="advanced"
                                id="advanced"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="advanced"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Advanced
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Continue to Schedule</Button>
                </form>
              </Form>
            )}
            
            {/* Step 2: Schedule Form */}
            {step === 2 && (
              <Form {...stepTwoForm}>
                <form onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)} className="space-y-6">
                  <FormField
                    control={stepTwoForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
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
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={stepTwoForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select start time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => {
                                const hour = i;
                                const hourFormatted = hour % 12 || 12;
                                const ampm = hour < 12 ? 'AM' : 'PM';
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hourFormatted}:00 {ampm}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stepTwoForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select end time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => {
                                const hour = i;
                                const hourFormatted = hour % 12 || 12;
                                const ampm = hour < 12 ? 'AM' : 'PM';
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hourFormatted}:00 {ampm}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={stepTwoForm.control}
                    name="recurring"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Recurring Event</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3"
                          >
                            <div>
                              <RadioGroupItem
                                value="once"
                                id="once"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="once"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                One-time
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="weekly"
                                id="weekly"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="weekly"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Weekly
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="biweekly"
                                id="biweekly"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="biweekly"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Bi-weekly
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="monthly"
                                id="monthly"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="monthly"
                                className="flex items-center justify-center p-3 border rounded-lg text-sm font-medium cursor-pointer peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary dark:peer-data-[state=checked]:bg-primary-900/30 dark:peer-data-[state=checked]:border-primary dark:peer-data-[state=checked]:text-primary-foreground dark:border-gray-700 dark:text-gray-300"
                              >
                                Monthly
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit">Continue to Location</Button>
                  </div>
                </form>
              </Form>
            )}
            
            {/* Step 3: Location Form */}
            {step === 3 && (
              <Form {...stepThreeForm}>
                <form onSubmit={stepThreeForm.handleSubmit(onStepThreeSubmit)} className="space-y-6">
                  <FormField
                    control={stepThreeForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Stanford Game Room, Card Kingdom Cafe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stepThreeForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stepThreeForm.control}
                    name="locationNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about the location (parking, entry instructions, etc.)" 
                            rows={3} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button type="submit">Create Session</Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionWizard;
