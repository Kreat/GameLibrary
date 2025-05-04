import { useRef, useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  currentUserId: number | null;
}

export function ChatMessageList({ 
  messages, 
  isLoading, 
  currentUserId 
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No messages yet. Be the first to start the conversation!
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            {...message}
            isCurrentUser={message.sender.id === currentUserId}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}