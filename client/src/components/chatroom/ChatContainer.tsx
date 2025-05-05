// container that combines the react components:
// ChatMessage, DisplayMessages, ChatInput

import React, { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChatInput } from "./ChatInput";
import { DisplayMessages } from "./DisplayMessages";
import { ChatMessageProps } from "./ChatMessage";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function ChatContainer() {
  const { user } = useAuth(); // NOTE: not used rn, since no one is logged in
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messageSource = "/api/messages";

  // Fetch messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery<Omit<ChatMessageProps, "isCurrentUser">[]>({
    queryKey: [messageSource],
    queryFn: async () => {
      const response = await fetch(messageSource);
      if (!response.ok) {
        const errorMessage = `Failed to fetch messages: ${response.status} ${response.statusText}\n${await response.text()}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Transform data to match ChatMessageProps format
      return data.map((message: any) => ({
        id: message.id.toString(),
        content: message.content,
        sender: message.sender || {
          id: message.senderId,
          username: "Unknown",
          displayName: null,
          photoUrl: null,
        },
        timestamp: new Date(message.timestamp),
      }));
    },
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Handle sending messages
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", messageSource, { content });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: [messageSource] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show error toast if messages fail to load
  useEffect(() => {
    if (messagesError) {
      toast({
        title: "Error loading messages",
        description: (messagesError as Error).message,
        variant: "destructive",
      });
    }
  }, [messagesError, toast]);

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    // if (!user) {
    //   toast({
    //     title: "Not logged in",
    //     description: "You must be logged in to send messages",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    sendMessage(content);
  };

  return (
    <Card className="shadow-md border-muted/40">
      <CardHeader className="p-4 pb-2 border-b">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Chat with others!</h2>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[400px] overflow-y-auto">
        <DisplayMessages messages={messages} isLoading={isLoadingMessages} />
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t max-w-full">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
      </CardFooter>
    </Card>
  );
}
