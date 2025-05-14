import { Link, useLocation } from "wouter";
import { useNavigation } from "@/hooks/use-navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Shield, MessageCircle, MessageSquare, Users, ThumbsUp, AlertTriangle, Info } from "lucide-react";

export function CommunityNorms() {
  const [location, setLocation] = useLocation();
  const { handleNavigationStart } = useNavigation();
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card/80 backdrop-blur-sm text-card-foreground shadow-md p-6 transition-all">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Our Community Norms</h2>
          <p className="text-muted-foreground">
            These guidelines help ensure GameHub is a reliable, accountable, and welcoming place for everyone.
          </p>
        </div>
        
        <Separator className="my-6" />
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg transition-all hover:bg-muted/30 px-4 py-2 rounded-md -mx-4 -my-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Reliability & Accountability</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Complete your profile
                </h4>
                <p className="text-muted-foreground text-sm">
                  Before hosting or joining sessions, complete your profile with accurate availability, games you play, and skill level. This helps others know who they're gaming with.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Honor your RSVP commitments
                </h4>
                <p className="text-muted-foreground text-sm">
                  Once you commit to a game session, you're expected to attend. RSVPs are locked 72 hours before the session, and no-shows affect your reliability rating.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                  Host cancellation policy
                </h4>
                <p className="text-muted-foreground text-sm">
                  Hosts must provide at least 24 hours notice if canceling a session. Last-minute cancellations impact your hosting score and ability to create future sessions.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg transition-all hover:bg-muted/30 px-4 py-2 rounded-md -mx-4 -my-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Inclusivity & Respect</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  Welcoming to all skill levels
                </h4>
                <p className="text-muted-foreground text-sm">
                  Indicate if your session is beginner-friendly. If hosting an advanced session, clearly state the expected experience level to set proper expectations.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  Patience and courtesy
                </h4>
                <p className="text-muted-foreground text-sm">
                  Be patient with new players, avoid harsh criticism, and focus on constructive feedback. Remember that everyone was a beginner once.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  Zero tolerance for harassment
                </h4>
                <p className="text-muted-foreground text-sm">
                  Any form of harassment, discriminatory language, or intentional exclusion will result in immediate action from moderators.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg transition-all hover:bg-muted/30 px-4 py-2 rounded-md -mx-4 -my-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span>Communication Standards</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  Give session feedback
                </h4>
                <p className="text-muted-foreground text-sm">
                  After sessions, provide constructive feedback to help hosts and players improve. Focus on specific behaviors rather than personal judgments.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                  No multichannel spam
                </h4>
                <p className="text-muted-foreground text-sm">
                  Don't post the same content in multiple forums or channels. Keep conversations relevant to their specific topics.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  Spoiler-free discussions
                </h4>
                <p className="text-muted-foreground text-sm">
                  For narrative games, use spoiler warnings and dedicated spoiler threads to avoid ruining the experience for others.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground max-w-xl">
                These norms are enforced through our reputation system, automated safeguards, and community moderation. Repeated violations may result in temporary restrictions.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                window.scrollTo(0, 0);
                handleNavigationStart();
                setLocation('/community');
              }}
              className="transition-all hover:bg-primary/10 flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Back to Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}