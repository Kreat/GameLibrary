import { useState, useEffect } from "react";
import { EyeOff, Info, MessageSquare, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SpoilerThreadDetectionProps {
  message: string;
  onCreateSpoilerThread?: () => void;
  onContinueInThread?: () => void;
}

export function SpoilerThreadDetection({ 
  message, 
  onCreateSpoilerThread,
  onContinueInThread
}: SpoilerThreadDetectionProps) {
  const [dismissed, setDismissed] = useState(false);
  
  // Detect likely spoiler content
  const containsSpoilerKeyword = /spoiler|spoilers|ending|reveal|twist|surprise ending/i.test(message);
  const explicitSpoilerTag = /\[spoiler\]|\#spoiler/i.test(message);
  const likelySpoilerContent = containsSpoilerKeyword || explicitSpoilerTag;
  
  const handleDismiss = () => {
    setDismissed(true);
  };
  
  const handleCreateSpoilerThread = () => {
    if (onCreateSpoilerThread) {
      onCreateSpoilerThread();
    }
    setDismissed(true);
  };
  
  const handleContinueInThread = () => {
    if (onContinueInThread) {
      onContinueInThread();
    }
    setDismissed(true);
  };
  
  if (dismissed || !likelySpoilerContent) {
    return null;
  }
  
  return (
    <Alert variant="default" className="mb-4">
      <EyeOff className="h-4 w-4" />
      <AlertTitle>Potential Spoiler Content Detected</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          Your message appears to contain spoiler content. According to our community norms,
          discussions containing spoilers should be marked and contained in dedicated threads.
        </p>
        
        <div className="bg-background/80 p-3 rounded mb-4 border space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Unmarked spoilers can diminish the experience for others who haven't finished a narrative game.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              We recommend either creating a dedicated spoiler thread or using our spoiler formatting.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCreateSpoilerThread}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Create Spoiler Thread</span>
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleContinueInThread}
          >
            <span>Use Spoiler Tags</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="mt-2 sm:mt-0"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}