// defines the field where the user types their message

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [messageText, setMessageText] = useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trim the message and check if it's not empty
    const trimmedMessage = messageText.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Shift+Enter or Ctrl+Enter
    if (
      (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) ||
      (e.key === "Enter" && !e.shiftKey && !isLoading)
    ) {
      e.preventDefault();
      const trimmedMessage = messageText.trim();
      if (trimmedMessage) {
        onSendMessage(trimmedMessage);
        setMessageText("");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary w-full max-h-[80px]"
    >
      <Textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={user ? "Type your message..." : "Please log in to chat"}
        className="max-h-[160px] w-full max-w-full pr-16 border-none focus-visible:ring-0 resize-none"
        disabled={!user || isLoading}
      />
      <Button
        type="submit"
        size="sm"
        disabled={!user || isLoading || !messageText.trim()}
        className="absolute bottom-2 right-2"
      >
        <SendHorizontal
          size={18}
          className={isLoading ? "animate-pulse" : ""}
        />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
