import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Share2, Flag, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Author {
  name: string;
  avatar: string;
}

interface ThreadComment {
  id: number;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
}

interface ThreadViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: number;
  title: string;
  category: string;
  categoryColor: string;
  categoryName: string;
  author: Author;
  content?: string;
  timestamp: string;
  likes: number;
  views: number;
  tags?: string[];
}

export function ThreadViewDialog({
  open,
  onOpenChange,
  threadId,
  title,
  category,
  categoryColor,
  categoryName,
  author,
  content = "This is the main thread content. It could be much longer and include detailed information.",
  timestamp,
  likes,
  views,
  tags = []
}: ThreadViewDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");
  
  // Sample comments for this thread
  const [comments, setComments] = useState<ThreadComment[]>([
    {
      id: 1,
      author: {
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "I completely agree with your point about strategy games. Catan is definitely a great gateway game!",
      timestamp: "2 hours ago",
      likes: 5
    },
    {
      id: 2,
      author: {
        name: "Jamie Lee",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "Has anyone tried Ticket to Ride? It's another excellent option for beginners.",
      timestamp: "1 hour ago",
      likes: 3
    }
  ]);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    
    // Add the new comment
    const newComment: ThreadComment = {
      id: comments.length + 1,
      author: {
        name: user?.displayName || "Anonymous User",
        avatar: user?.photoURL || ""
      },
      content: replyContent,
      timestamp: "Just now",
      likes: 0
    };
    
    setComments([...comments, newComment]);
    setReplyContent("");
    
    toast({
      title: "Reply posted",
      description: "Your comment has been added to the discussion",
    });
  };

  const handleLike = () => {
    toast({
      title: "Liked",
      description: "You liked this thread",
      variant: "default"
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + "/community/thread/" + threadId);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
      variant: "default"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={categoryColor}>
              {categoryName}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-display">{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <span>Posted by {author.name}</span>
            <span>•</span>
            <span>{timestamp}</span>
            <span>•</span>
            <span>{views} views</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Main post */}
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="prose dark:prose-invert max-w-none">
                <p>{content}</p>
              </div>
              
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleLike} className="text-gray-500 dark:text-gray-400 gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-500 dark:text-gray-400">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Comments section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
            
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1 h-7 px-2">
                        <Heart className="h-3 w-3" />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1 h-7 px-2">
                        <Flag className="h-3 w-3" />
                        <span>Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add comment */}
            {user ? (
              <div className="mt-8">
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback>{(user.displayName || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Add to this discussion..." 
                      className="mb-2 resize-none"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitReply}>
                        Post Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 border border-dashed rounded-md text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Sign in to join the discussion</p>
                <Button asChild>
                  <a href="/auth">Sign In</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}