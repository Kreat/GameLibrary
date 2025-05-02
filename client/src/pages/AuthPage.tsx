import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [isRequestingReset, setIsRequestingReset] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const usernameTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Redirect to home if already logged in
  if (user && !isLoading) {
    setLocation("/");
    return null;
  }
  
  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    // Don't check if username is too short
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    try {
      setCheckingUsername(true);
      const response = await fetch(`/api/check-username/${username}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username availability:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Login Form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register Form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });
  
  // Forgot Password Form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Reset Password Form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest("POST", "/api/login", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to login");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormValues, "confirmPassword">) => {
      const response = await apiRequest("POST", "/api/register", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: `Welcome to GameHub, ${data.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 min-h-[calc(100vh-64px)] items-center">
      {/* Auth Form Column */}
      <div className="w-full max-w-md mx-auto">
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${activeTab === "forgotPassword" || activeTab === "resetPassword" ? "grid-cols-3" : "grid-cols-2"} mb-8`}>
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
            {(activeTab === "forgotPassword" || activeTab === "resetPassword") && (
              <TabsTrigger value="forgotPassword">Reset Password</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Button 
                              variant="link" 
                              className="px-0 h-5 text-xs text-primary"
                              type="button"
                              onClick={() => setActiveTab("forgotPassword")}
                            >
                              Forgot Password?
                            </Button>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")}
                    className="text-primary hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => toast({
                    title: "Coming soon!",
                    description: "Google sign-in will be available soon.",
                  })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                  </svg>
                  Sign in with Google
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Enter your details to join GameHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="yourusername" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Clear any existing timeout
                                  if (usernameTimeout.current) {
                                    clearTimeout(usernameTimeout.current);
                                  }
                                  
                                  // Set a new timeout to check username availability
                                  usernameTimeout.current = setTimeout(() => {
                                    checkUsernameAvailability(e.target.value);
                                  }, 500); // Wait for 500ms after user stops typing
                                }}
                              />
                            </FormControl>
                            {field.value.length >= 3 && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checkingUsername ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : usernameAvailable === true ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : usernameAvailable === false ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : null}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                          {usernameAvailable === false && field.value.length >= 3 && (
                            <p className="text-xs text-red-500 mt-1">This username is already taken</p>
                          )}
                          {usernameAvailable === true && field.value.length >= 3 && (
                            <p className="text-xs text-green-500 mt-1">Username is available</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="How others will see you" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")}
                    className="text-primary hover:underline"
                  >
                    Sign In
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => toast({
                    title: "Coming soon!",
                    description: "Google sign-up will be available soon.",
                  })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                  </svg>
                  Sign up with Google
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="forgotPassword">
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!resetToken ? (
                  <Form {...forgotPasswordForm}>
                    <form 
                      onSubmit={forgotPasswordForm.handleSubmit(async (data) => {
                        try {
                          setIsRequestingReset(true);
                          
                          // Request password reset from the API
                          const response = await fetch("/api/request-password-reset", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email: data.email }),
                          });
                          
                          if (!response.ok) {
                            throw new Error("Failed to request password reset");
                          }
                          
                          toast({
                            title: "Reset link sent",
                            description: "If an account exists with this email, you will receive a password reset link"
                          });
                          
                          // For demo purposes, we'll simulate receiving a reset token
                          setTimeout(() => {
                            setResetToken("demo-reset-token");
                            setIsRequestingReset(false);
                          }, 1500);
                        } catch (error) {
                          setIsRequestingReset(false);
                          toast({
                            title: "Error",
                            description: "There was a problem requesting a password reset. Please try again.",
                            variant: "destructive"
                          });
                        }
                      })} 
                      className="space-y-4"
                    >
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isRequestingReset}
                      >
                        {isRequestingReset ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...resetPasswordForm}>
                    <form 
                      onSubmit={resetPasswordForm.handleSubmit(async (data) => {
                        try {
                          setIsResettingPassword(true);
                          
                          // Reset password via the API
                          const response = await fetch("/api/reset-password", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ 
                              token: resetToken,
                              password: data.password
                            }),
                          });
                          
                          if (!response.ok) {
                            throw new Error("Failed to reset password");
                          }
                          
                          toast({
                            title: "Password reset successful",
                            description: "Your password has been reset. You can now sign in with your new password."
                          });
                          
                          // Redirect to login
                          setResetToken(null);
                          setActiveTab("login");
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "There was a problem resetting your password. Please try again.",
                            variant: "destructive"
                          });
                        } finally {
                          setIsResettingPassword(false);
                        }
                      })} 
                      className="space-y-4"
                    >
                      <div className="bg-primary/10 text-primary p-3 rounded-md mb-4 text-sm">
                        Enter your new password below.
                      </div>
                      <FormField
                        control={resetPasswordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={resetPasswordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isResettingPassword}
                      >
                        {isResettingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center text-muted-foreground w-full">
                  Remember your password?{" "}
                  <button 
                    onClick={() => {
                      setResetToken(null);
                      setActiveTab("login");
                    }}
                    className="text-primary hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hero Section Column */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-meepleGold/10 to-slateNight/5 rounded-lg shadow-lg">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-meepleGold to-boardRed bg-clip-text text-transparent">
            Welcome to GameHub
          </h1>
          <p className="text-lg mb-8 text-slateNight dark:text-white">
            Join our community of tabletop game enthusiasts. Find game sessions, connect with players, and discover new games.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slateNight to-slateNight/90 p-4 rounded-lg shadow-lg border border-meepleGold/20 hover:border-meepleGold/50 transition-all">
              <h3 className="font-semibold text-meepleGold mb-2">Find Games</h3>
              <p className="text-sm text-white/80">Discover new games and sessions near you</p>
            </div>
            <div className="bg-gradient-to-br from-slateNight to-slateNight/90 p-4 rounded-lg shadow-lg border border-meepleGold/20 hover:border-meepleGold/50 transition-all">
              <h3 className="font-semibold text-meepleGold mb-2">Connect</h3>
              <p className="text-sm text-white/80">Meet players with similar interests</p>
            </div>
            <div className="bg-gradient-to-br from-slateNight to-slateNight/90 p-4 rounded-lg shadow-lg border border-meepleGold/20 hover:border-meepleGold/50 transition-all">
              <h3 className="font-semibold text-meepleGold mb-2">Organize</h3>
              <p className="text-sm text-white/80">Schedule and manage your gaming sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}