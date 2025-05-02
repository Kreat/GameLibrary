import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { db, signInWithGoogle, logOut } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Calendar, Clock, Settings, Gamepad, Camera, Upload } from "lucide-react";

// Define the profile form schema with Zod
const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }),
  location: z.string().optional(),
  favoriteGames: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define the availability form schema
const availabilityFormSchema = z.object({
  weekdayMorning: z.boolean().optional(),
  weekdayAfternoon: z.boolean().optional(),
  weekdayEvening: z.boolean().optional(),
  weekendMorning: z.boolean().optional(),
  weekendAfternoon: z.boolean().optional(),
  weekendEvening: z.boolean().optional(),
  notes: z.string().optional(),
});

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

const ProfilePage = () => {
  const [_, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      location: "",
      favoriteGames: "",
    },
  });

  // Initialize availability form
  const availabilityForm = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      weekdayMorning: false,
      weekdayAfternoon: false,
      weekdayEvening: false,
      weekendMorning: false,
      weekendAfternoon: false,
      weekendEvening: false,
      notes: "",
    },
  });

  // Simulate profile data for demonstration
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // For demonstration, instead of firebase fetch, use mock data
        const mockUserData = {
          displayName: user.displayName || "Demo Player",
          bio: "Enthusiastic board game player and RPG fan. I love strategy games and collaborative storytelling games.",
          location: "Seattle, WA",
          favoriteGames: "Catan, D&D 5e, Gloomhaven, Magic: The Gathering",
          availability: {
            weekdayMorning: false,
            weekdayAfternoon: false,
            weekdayEvening: true,
            weekendMorning: true, 
            weekendAfternoon: true,
            weekendEvening: true,
            notes: "I'm usually available on weekends and weekday evenings after 7pm."
          }
        };
        
        // Simulate a brief loading delay
        setTimeout(() => {
          setProfileData(mockUserData);
          
          // Update form values
          profileForm.reset({
            displayName: mockUserData.displayName,
            bio: mockUserData.bio,
            location: mockUserData.location,
            favoriteGames: mockUserData.favoriteGames,
          });
          
          availabilityForm.reset({
            weekdayMorning: mockUserData.availability.weekdayMorning,
            weekdayAfternoon: mockUserData.availability.weekdayAfternoon,
            weekdayEvening: mockUserData.availability.weekdayEvening,
            weekendMorning: mockUserData.availability.weekendMorning,
            weekendAfternoon: mockUserData.availability.weekendAfternoon,
            weekendEvening: mockUserData.availability.weekendEvening,
            notes: mockUserData.availability.notes,
          });
          
          setProfileLoading(false);
        }, 800);
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load profile data. Please try again later.",
          variant: "destructive",
        });
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, profileForm, availabilityForm, toast]);

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        ...data,
        userId: user.uid,
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true });
      
      setProfileData((prev: any) => ({ ...prev, ...data }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle availability form submission
  const onAvailabilitySubmit = async (data: AvailabilityFormValues) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        availability: data,
        updatedAt: new Date(),
      }, { merge: true });
      
      setProfileData((prev: any) => ({ ...prev, availability: data }));
      
      toast({
        title: "Availability updated",
        description: "Your availability preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Update failed",
        description: "Could not update your availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle sign in with Google
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Signed in successfully",
        description: "Welcome to GameHub!",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    const file = event.target.files[0];
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadingPhoto(true);
    
    try {
      // Get Firebase storage reference
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}-${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      
      // Update user profile with new photo URL
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        photoURL: url,
        updatedAt: new Date(),
      }, { merge: true });
      
      // Update state
      setPhotoURL(url);
      
      toast({
        title: "Photo uploaded",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Trigger file upload dialog
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  // SEO - Set document title
  useEffect(() => {
    document.title = "Profile - GameHub";
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in page if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Sign In to GameHub</CardTitle>
            <CardDescription>Connect with fellow gamers and join gaming sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
              <Gamepad className="h-8 w-8 text-primary" />
            </div>
            <Button className="w-full" onClick={handleSignIn}>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="md:w-1/3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative group mb-2">
                    <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                      <AvatarImage src={photoURL || user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mb-4 flex items-center gap-2"
                    onClick={triggerFileUpload}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    Change Profile Picture
                  </Button>
                  <h2 className="text-xl font-bold">
                    {profileLoading ? "Loading..." : (profileData?.displayName || user.displayName || "New User")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  
                  <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-4">
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                          activeTab === "profile" 
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="mr-2 h-5 w-5" />
                        <span>Profile</span>
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                          activeTab === "availability" 
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveTab("availability")}
                      >
                        <Clock className="mr-2 h-5 w-5" />
                        <span>Availability</span>
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                          activeTab === "sessions" 
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveTab("sessions")}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        <span>My Sessions</span>
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                          activeTab === "settings" 
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="mr-2 h-5 w-5" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full mt-6">
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3 w-full">
            {profileLoading ? (
              <Card>
                <CardContent className="p-8 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : (
              <>
                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us a bit about yourself..." 
                                    rows={3} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Brief description about yourself as a gamer.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="City, State, Country" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This helps find local gaming sessions.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="favoriteGames"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Favorite Games</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Catan, Magic: The Gathering, D&D 5e..."
                                    rows={2}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  List games you enjoy playing, separated by commas.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">Update Profile</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "availability" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Gaming Availability</CardTitle>
                      <CardDescription>Set when you're typically available for games</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...availabilityForm}>
                        <form onSubmit={availabilityForm.handleSubmit(onAvailabilitySubmit)} className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Weekdays</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={availabilityForm.control}
                                name="weekdayMorning"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Morning</FormLabel>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={availabilityForm.control}
                                name="weekdayAfternoon"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Afternoon</FormLabel>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={availabilityForm.control}
                                name="weekdayEvening"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Evening</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Weekends</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={availabilityForm.control}
                                name="weekendMorning"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Morning</FormLabel>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={availabilityForm.control}
                                name="weekendAfternoon"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Afternoon</FormLabel>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={availabilityForm.control}
                                name="weekendEvening"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">Evening</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <FormField
                            control={availabilityForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any specific details about your availability..."
                                    rows={3}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  For example: "Available after 7pm on Tuesdays, all day on Saturdays"
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">Update Availability</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "sessions" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Sessions</CardTitle>
                      <CardDescription>Gaming sessions you're hosting or participating in</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="upcoming">
                        <TabsList className="mb-4">
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                          <TabsTrigger value="hosting">Hosting</TabsTrigger>
                          <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upcoming">
                          <div className="space-y-4">
                            <div className="rounded-lg border overflow-hidden">
                              <div className="bg-primary/20 p-3 flex justify-between items-center">
                                <div className="flex items-center font-medium">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>May 5, 2025 • 7:00 PM</span>
                                </div>
                                <span className="text-xs bg-primary px-2 py-1 rounded-full">Board Game</span>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold">Catan Tournament Night</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Join us for an evening of strategic gameplay. All expansions will be available.
                                </p>
                                <div className="text-xs text-gray-500 mb-2">
                                  <span className="font-medium">Location:</span> Game Store Downtown
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                  <div className="flex -space-x-2">
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback>KJ</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback>SR</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback>TM</AvatarFallback>
                                    </Avatar>
                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                      +2
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">Leave Session</Button>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                              <div className="bg-accent/20 p-3 flex justify-between items-center">
                                <div className="flex items-center font-medium">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>May 12, 2025 • 6:30 PM</span>
                                </div>
                                <span className="text-xs bg-accent px-2 py-1 rounded-full">Card Game</span>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold">Magic: The Gathering Draft</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Casual draft night with the latest set. $15 entry includes 3 packs.
                                </p>
                                <div className="text-xs text-gray-500 mb-2">
                                  <span className="font-medium">Location:</span> Card Kingdom Cafe
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                  <div className="flex -space-x-2">
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback>CJ</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                      <AvatarFallback>DP</AvatarFallback>
                                    </Avatar>
                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                      +5
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">Leave Session</Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-center">
                              <Button className="mt-4" asChild>
                                <a href="/sessions">Find More Sessions</a>
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="hosting">
                          <div className="rounded-lg border overflow-hidden mb-4">
                            <div className="bg-purple-800 text-white p-3 flex justify-between items-center">
                              <div className="flex items-center font-medium">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>May 20, 2025 • 6:00 PM</span>
                              </div>
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">RPG</span>
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold">D&D 5e - Curse of Strahd</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Character level 3-5. New campaign starting! Beginner-friendly.
                              </p>
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">Location:</span> Your Place
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 mb-3">
                                <h5 className="text-sm font-medium mb-2">Participants (3/5)</h5>
                                <div className="flex flex-wrap gap-2">
                                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback>H</AvatarFallback>
                                    </Avatar>
                                    <span>Hannah</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback>I</AvatarFallback>
                                    </Avatar>
                                    <span>Ivan</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback>J</AvatarFallback>
                                    </Avatar>
                                    <span>Jamie</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between">
                                <Button size="sm" variant="outline">Edit Session</Button>
                                <Button size="sm" variant="destructive">Cancel Session</Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-center">
                            <Button className="mt-4" asChild>
                              <a href="/create-session">Host Another Session</a>
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="past">
                          <div className="space-y-4">
                            <div className="rounded-lg border overflow-hidden opacity-70">
                              <div className="bg-gray-200 dark:bg-gray-700 p-3 flex justify-between items-center">
                                <div className="flex items-center font-medium">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>April 15, 2025 • 7:00 PM</span>
                                </div>
                                <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">Board Game</span>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold">Ticket to Ride Night</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  All editions available! Come travel across the world on trains.
                                </p>
                                <div className="flex justify-between">
                                  <div className="flex items-center text-xs">
                                    <User className="mr-1 h-3 w-3" />
                                    <span>Hosted by Alex</span>
                                  </div>
                                  <Button size="sm" variant="ghost">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border overflow-hidden opacity-70">
                              <div className="bg-gray-200 dark:bg-gray-700 p-3 flex justify-between items-center">
                                <div className="flex items-center font-medium">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>March 28, 2025 • 6:00 PM</span>
                                </div>
                                <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">Card Game</span>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold">Dominion Tournament</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Multiple expansions! Strategy guide provided for beginners.
                                </p>
                                <div className="flex justify-between">
                                  <div className="flex items-center text-xs">
                                    <User className="mr-1 h-3 w-3" />
                                    <span>Hosted by Morgan</span>
                                  </div>
                                  <Button size="sm" variant="ghost">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
                
                {activeTab === "settings" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-1">Email</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="email-notifications"
                                defaultChecked
                                className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                              />
                              <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Email notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="session-reminders"
                                defaultChecked
                                className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                              />
                              <label htmlFor="session-reminders" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Session reminders
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="new-matches"
                                defaultChecked
                                className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                              />
                              <label htmlFor="new-matches" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                New game matches
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Game Preferences</h3>
                          <div className="grid gap-4">
                            <div>
                              <h4 className="text-base font-medium mb-2">Favorite Game Types</h4>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">Board Games</span>
                                <span className="bg-accent text-white px-2 py-1 rounded-full text-xs">Card Games</span>
                                <span className="bg-purple-800 text-white px-2 py-1 rounded-full text-xs">RPG</span>
                                <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">+ Add More</span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-base font-medium mb-2">Player Type</h4>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="casual"
                                    name="player-type"
                                    className="mr-2"
                                    defaultChecked
                                  />
                                  <label htmlFor="casual">Casual - I play for fun</label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="competitive"
                                    name="player-type"
                                    className="mr-2"
                                  />
                                  <label htmlFor="competitive">Competitive - I play to win</label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    id="mixed"
                                    name="player-type"
                                    className="mr-2"
                                  />
                                  <label htmlFor="mixed">Mixed - It depends on the game</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Privacy</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-base font-medium">Profile Visibility</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Control who can view your profile information
                                </p>
                              </div>
                              <select className="form-select rounded border-gray-300 focus:border-primary focus:ring-primary bg-background px-3 py-1.5">
                                <option>Public</option>
                                <option>Members Only</option>
                                <option>Friends Only</option>
                              </select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-base font-medium">Session History</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Control who can see your past gaming sessions
                                </p>
                              </div>
                              <select className="form-select rounded border-gray-300 focus:border-primary focus:ring-primary bg-background px-3 py-1.5">
                                <option>Public</option>
                                <option selected>Members Only</option>
                                <option>Friends Only</option>
                                <option>Only Me</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline">Reset</Button>
                          <Button>Save Preferences</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
