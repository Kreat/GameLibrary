import { ChatContainer } from "@/components/chatroom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const ChatPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Global Chat</h1>
          <p className="text-muted-foreground mt-2">
            Join the conversation with fellow gamers from around the world!
          </p>
        </div>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ChatContainer />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">Chat Rules</h3>
                <ul className="space-y-2 text-sm">
                  <li>Be respectful to all members</li>
                  <li>No spam or excessive messages</li>
                  <li>Keep discussions game-related</li>
                  <li>No sharing of personal information</li>
                  <li>No promotion of external sites/services</li>
                </ul>
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-2">Online Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">You are online as {user.username}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join the Conversation</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to participate in the global chat.
            </p>
            <Button onClick={() => setLocation("/auth")}>
              Sign In to Chat
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChatPage;