import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, MessageCircle, Share2, Eye } from "lucide-react";

type ThreadViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: number;
  title: string;
  category: string;
  categoryName: string;
  categoryColor: string;
  author: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  views: number;
  likes: number;
  tags: string[];
};

export function ThreadViewDialog({
  open,
  onOpenChange,
  threadId,
  title,
  category,
  categoryName,
  categoryColor,
  author,
  timestamp,
  views,
  likes,
  tags,
}: ThreadViewDialogProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  // Sample thread content (in a real app, this would be fetched)
  const sampleContent = `
    I've recently started playing Catan with my friends and I'm having a hard time figuring out the best strategy. I usually end up with too many brick resources and not enough sheep.
    
    What are some good strategies for beginners? Should I focus on expanding quickly or building cities? How important is the longest road?
    
    Any tips would be greatly appreciated!
  `;
  
  // Sample comments (in a real app, these would be fetched)
  const sampleComments = [
    {
      id: 1,
      author: {
        name: "Mike R.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "For beginners, I'd recommend focusing on settlements first rather than going for cities too early. The 2:1 ports can be really valuable if you can position yourself near one that matches your resource production.",
      timestamp: "1 hour ago",
      likes: 5
    },
    {
      id: 2,
      author: {
        name: "Elena P.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "Don't underestimate development cards! Knights can help you control the robber, and the victory point cards are hidden from other players so they might not realize how close you are to winning.",
      timestamp: "2 hours ago",
      likes: 3
    }
  ];
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={categoryColor}>
              {categoryName}
            </Badge>
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {tag}
              </Badge>
            ))}
          </div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <span>{author.name}</span>
            <span className="text-gray-500 dark:text-gray-400">• {timestamp}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="whitespace-pre-line mb-6">{sampleContent}</div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                className={`flex items-center gap-1 hover:text-primary ${isLiked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={toggleLike}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{isLiked ? likes + 1 : likes}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                <span>{sampleComments.length}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>{views}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <h3 className="font-medium">Comments ({sampleComments.length})</h3>
            
            {sampleComments.map(comment => (
              <div key={comment.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{comment.author.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{comment.timestamp}</div>
                  </div>
                </div>
                
                <p className="mb-3">{comment.content}</p>
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary text-sm">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary text-sm">
                    <MessageCircle className="h-3 w-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <textarea 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                placeholder="Write a comment..."
                rows={3}
              ></textarea>
              <div className="mt-2 flex justify-end">
                <Button>Post Comment</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}