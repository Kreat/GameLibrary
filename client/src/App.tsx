import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import GamesPage from "@/pages/GamesPage";
import SessionsPage from "@/pages/SessionsPage";
import CommunityPage from "@/pages/CommunityPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import { useEffect } from "react";
import { auth } from "./lib/firebase"; // Import our mock auth
import { useAuth } from "./context/AuthContext";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/games" component={GamesPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/community" component={CommunityPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/create-session" component={CreateSessionPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { setUser, setLoading } = useAuth();

  useEffect(() => {
    // Use our mock auth's onAuthStateChanged method
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
