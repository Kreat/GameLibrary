import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageProps } from "./ChatMessage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChatMessage } from "@shared/schema";

export function ChatContainer() {
  const { user } = useAuth();
  const queryKey = ["/api/messages"];
  
  // Fetch messages
  const { 
    data: messagesData = [], 
    isLoading,
    isError,
    error
  } = useQuery<any[]>({
    queryKey,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Format the chat messages for display
  const messages: ChatMessageProps[] = messagesData.map((msg: any) => ({
    id: msg.messageId || msg.id.toString(),
    content: msg.content,
    sender: {
      id: msg.senderId,
      username: msg.sender?.username || 'Anonymous',
      displayName: msg.sender?.displayName,
      photoUrl: msg.sender?.photoUrl
    },
    timestamp: new Date(msg.timestamp || Date.now()),
    isCurrentUser: msg.senderId === user?.id
  }));
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    if (!user) return;
    
    sendMessageMutation.mutate(content);
  };

  // Show error if there is one
  if (isError) {
    return (
      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Global Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-destructive">
          Error loading messages: {error instanceof Error ? error.message : 'Unknown error'}
        </CardContent>
      </Card>
    );
  }

  // Render chat container
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Global Chat</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <ChatMessageList 
            messages={messages}
            isLoading={isLoading}
            currentUserId={user?.id || null}
          />
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="p-4">
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
        />
      </CardFooter>
    </Card>
  );
}