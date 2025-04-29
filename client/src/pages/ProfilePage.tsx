import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { db, signInWithGoogle, logOut } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Calendar, Clock, Settings, Gamepad } from "lucide-react";

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
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
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

  // Fetch profile data when user is authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData(userData);
          
          // Update form values
          profileForm.reset({
            displayName: userData.displayName || user.displayName || "",
            bio: userData.bio || "",
            location: userData.location || "",
            favoriteGames: userData.favoriteGames || "",
          });
          
          availabilityForm.reset({
            weekdayMorning: userData.availability?.weekdayMorning || false,
            weekdayAfternoon: userData.availability?.weekdayAfternoon || false,
            weekdayEvening: userData.availability?.weekdayEvening || false,
            weekendMorning: userData.availability?.weekendMorning || false,
            weekendAfternoon: userData.availability?.weekendAfternoon || false,
            weekendEvening: userData.availability?.weekendEvening || false,
            notes: userData.availability?.notes || "",
          });
        } else if (user.displayName) {
          // If user exists in Firebase Auth but not in Firestore,
          // pre-populate with data from Auth
          profileForm.reset({
            displayName: user.displayName || "",
            bio: "",
            location: "",
            favoriteGames: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
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
  if (loading) {
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
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-2xl">
                      {user.displayName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
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
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">You're not part of any upcoming sessions.</p>
                            <Button className="mt-4" asChild>
                              <a href="/sessions">Find Sessions</a>
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="hosting">
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">You're not hosting any sessions.</p>
                            <Button className="mt-4" asChild>
                              <a href="/create-session">Host a Session</a>
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="past">
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No past sessions found.</p>
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
                        
                        <Button variant="outline">Save Preferences</Button>
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
