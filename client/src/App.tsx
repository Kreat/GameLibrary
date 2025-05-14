import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import GamesPage from "@/pages/GamesPage";
import SessionsPage from "@/pages/SessionsPage";
import ChatPage from "@/pages/ChatPage";
import CommunityPage from "@/pages/CommunityPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import JoinSessionPage from "@/pages/JoinSessionPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import CommunityNormsPage from "@/pages/CommunityNormsPage";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/pages/AdminPage";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useNavigation } from "@/hooks/use-navigation";
import { useEffect } from "react";

function Router() {
  // Use our custom navigation hook
  useNavigation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={HomePage} />
          <Route path="/games" component={GamesPage} />
          <Route path="/sessions" component={SessionsPage} />
          <Route path="/chat" component={ChatPage} />
          <Route path="/community" component={CommunityPage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/community-norms" component={CommunityNormsPage} />
          <ProtectedRoute path="/profile/:userId" component={ProfilePage} />
          <ProtectedRoute
            path="/create-session"
            component={CreateSessionPage}
          />
          <ProtectedRoute
            path="/admin"
            component={AdminPage}
          />
          <Route path="/join/:id" component={JoinSessionPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
