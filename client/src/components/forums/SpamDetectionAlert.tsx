import { useState } from "react";
import { AlertTriangle, Info, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SpamDetectionAlertProps {
  message: string;
  similarMessages?: Array<{id: string | number, content: string, channel: string}>;
  onDismiss?: () => void;
}

export function SpamDetectionAlert({ 
  message, 
  similarMessages = [], 
  onDismiss 
}: SpamDetectionAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const hasSimilarMessages = similarMessages.length > 0;
  
  // Calculate similarity - this is a simple implementation that could be improved
  const getSimilarity = (str1: string, str2: string): number => {
    // Basic normalization
    const normalize = (s: string) => s.toLowerCase().trim();
    const a = normalize(str1);
    const b = normalize(str2);
    
    // If either is empty, return 0
    if (!a.length || !b.length) return 0;
    
    // If they're the same, return 1
    if (a === b) return 1;
    
    // Simple Jaccard similarity - count overlapping words
    const wordsAArray = a.split(/\s+/);
    const wordsBArray = b.split(/\s+/);
    const wordsA = new Set(wordsAArray);
    const wordsB = new Set(wordsBArray);
    
    let intersection = 0;
    wordsAArray.forEach(word => {
      if (wordsB.has(word)) {
        intersection++;
      }
    });
    
    return intersection / (wordsA.size + wordsB.size - intersection);
  };
  
  // Determine the highest similarity score
  const highestSimilarity = similarMessages.reduce((highest, msg) => {
    const similarity = getSimilarity(message, msg.content);
    return similarity > highest ? similarity : highest;
  }, 0);
  
  // Use the similarity score to determine the severity of the alert
  const isHighlySimilar = highestSimilarity > 0.7;
  
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };
  
  if (dismissed || !hasSimilarMessages) {
    return null;
  }
  
  return (
    <Alert variant={isHighlySimilar ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Possible Duplicate Content</span>
        <button 
          onClick={handleDismiss}
          className="text-xs hover:underline ml-2" 
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          {isHighlySimilar
            ? "This message appears to be very similar to content you've posted elsewhere."
            : "This message has some similarity to content you've posted in other channels."}
        </p>
        
        {isHighlySimilar && (
          <div className="text-sm bg-background/80 p-2 rounded mb-2 border">
            <p>
              Our community norm against multichannel spam helps keep discussions focused and relevant. 
              Posting identical content in more than 2 places may result in a temporary restriction.
            </p>
          </div>
        )}
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs flex items-center mt-1 hover:underline"
        >
          <Info className="h-3 w-3 mr-1" />
          {showDetails ? "Hide details" : "Show details"}
        </button>
        
        {showDetails && (
          <div className="mt-2 text-xs space-y-2">
            <p className="font-semibold">Similar content found in:</p>
            <ul className="space-y-1">
              {similarMessages.map((msg) => (
                <li key={msg.id} className="flex items-start gap-1">
                  <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-medium">{msg.channel}</span>: 
                    <span className="ml-1 opacity-80">{msg.content.substring(0, 30)}...</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}