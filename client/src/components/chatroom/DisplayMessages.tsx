// takes as input a list of messages
// defines how the messages are arranged on the UI
// also defines special messages for loading and no messages

import React, { useEffect, useRef } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { useAuth } from "@/hooks/use-auth";

interface MessageListProps {
  messages: Omit<ChatMessageProps, "isCurrentUser">[];
  isLoading: boolean;
}

export function DisplayMessages({ messages, isLoading }: MessageListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-6">
        <p className="mb-2">No messages yet</p>
        <p className="text-sm">Be the first to start the conversation!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 pb-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          {...message}
          isCurrentUser={message.sender.id === user?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}