import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BeginnerFriendlyTag() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:bg-green-500/20 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Beginner-friendly</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>This session welcomes players of all experience levels. The host will provide guidance and support for beginners.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}