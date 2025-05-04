import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  id: string;
  content: string;
  sender: {
    id: number;
    username: string;
    displayName?: string;
    photoUrl?: string;
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
  // Format timestamp to show in a readable format
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(timestamp);

  return (
    <div
      className={cn(
        "flex mb-4 max-w-[80%]",
        isCurrentUser ? "ml-auto" : "mr-auto"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={sender.photoUrl || ""} alt={sender.username} />
          <AvatarFallback>
            {(sender.displayName || sender.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-2 shadow-sm",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {!isCurrentUser && (
          <div className="font-medium text-sm mb-1">
            {sender.displayName || sender.username}
          </div>
        )}
        <div className="text-sm">{content}</div>
        <div
          className={cn(
            "text-xs mt-1",
            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formattedTime}
        </div>
      </div>

      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={sender.photoUrl || ""} alt={sender.username} />
          <AvatarFallback>
            {(sender.displayName || sender.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}