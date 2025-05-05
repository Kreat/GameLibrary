// defines how each message is displayed in the UI
// NOTE: why does this work even though we don't have a chat page in client/src/pages?

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface ChatMessageProps {
  id: string;
  content: string;
  sender: {
    id: number;
    username: string;
    displayName: string | null;
    photoUrl: string | null;
  };
  timestamp: Date;
  isCurrentUser: boolean;
}

export function ChatMessage({
  content,
  sender,
  timestamp,
  isCurrentUser,
}: ChatMessageProps) {
  // Get sender name (use display name if available, otherwise username)
  const senderName = sender?.displayName || sender?.username || "Anonymous";
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 mt-1">
        {sender?.photoUrl ? (
          <AvatarImage src={sender.photoUrl} alt={senderName} />
        ) : null}
        <AvatarFallback className={cn(
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {getInitials(senderName)}
        </AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "font-medium",
            isCurrentUser ? "text-primary" : "text-foreground"
          )}>
            {senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(timestamp, "MMM d, h:mm a")}
          </span>
        </div>
        
        <Card className={cn(
          "shadow-sm",
          isCurrentUser
            ? "bg-primary/10 border-primary/20"
            : "bg-muted/40 border-muted/30"
        )}>
          <CardContent className="p-3 text-sm">
            {content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}