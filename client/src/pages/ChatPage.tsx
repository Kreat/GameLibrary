import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatContainer } from "@/components/chatroom/ChatContainer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    // This will only show briefly before redirect happens
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Global Chat
            </h1>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Back to Home
            </Button>
          </div>
          
          <p className="text-muted-foreground">
            Chat with other gamers worldwide in our central community hub. Connect, share tips, find players, and discuss your favorite games!
          </p>

          <ChatContainer />
        </div>
      </div>
    </PageLayout>
  );
}