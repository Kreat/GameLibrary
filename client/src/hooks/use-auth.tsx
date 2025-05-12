import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  favoriteGames: string | null;
  photoUrl: string | null;
  firebaseUid: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
};

type LoginData = {
  username: string;
  email: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Create a mock user for demonstration purposes
  const mockUser: User = {
    id: 1,
    username: "kwonk",
    email: "kwonk@stanford.edu",
    displayName: "Kevin",
    bio: "Stanford student and tabletop gaming enthusiast.",
    location: "Stanford, CA",
    favoriteGames: "Catan, D&D 5e, Gloomhaven, Magic: The Gathering",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamehub",
    firebaseUid: "stanford-user-123",
    role: "admin", // Setting as admin for demo purposes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Create state for our user so we can toggle it on/off for demonstration
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);
  
  // For demo purposes
  const { 
    data: user = currentUser, 
    error = null,
    isLoading = false
  } = { data: currentUser } as const;

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      // For demo - validate Stanford email
      if (!credentials.email.endsWith('@stanford.edu')) {
        throw new Error("Only Stanford email addresses are allowed.");
      }
      
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      return mockUser; // For demo purposes, return mock user
    },
    onSuccess: (user) => {
      // Update our local state
      setCurrentUser(user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to GameHub, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // For demo purposes, simulate a successful API call
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear our local state 
      setCurrentUser(null);
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}