import { Switch, Route, useLocation } from "wouter";
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
import CommunityPage from "@/pages/CommunityPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import JoinSessionPage from "@/pages/JoinSessionPage";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/page-transition";

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Switch key={location}>
            <Route path="/auth">
              <PageTransition>
                <AuthPage />
              </PageTransition>
            </Route>
            <Route path="/">
              <PageTransition>
                <HomePage />
              </PageTransition>
            </Route>
            <Route path="/games">
              <PageTransition>
                <GamesPage />
              </PageTransition>
            </Route>
            <Route path="/sessions">
              <PageTransition>
                <SessionsPage />
              </PageTransition>
            </Route>
            <Route path="/community">
              <PageTransition>
                <CommunityPage />
              </PageTransition>
            </Route>
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/create-session" component={CreateSessionPage} />
            <Route path="/join/:id">
              <PageTransition>
                <JoinSessionPage />
              </PageTransition>
            </Route>
            <Route>
              <PageTransition>
                <NotFound />
              </PageTransition>
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
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
