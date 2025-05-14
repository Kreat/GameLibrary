import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Shield, Users, Calendar, Star, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function CommunityNorms() {
  const [normsContent, setNormsContent] = useState<string | null>(null);

  // Fetch norms markdown file 
  useEffect(() => {
    fetch('/docs/norms.md')
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Failed to load community norms');
      })
      .then(text => {
        setNormsContent(text);
      })
      .catch(error => {
        console.error("Error loading norms:", error);
      });
  }, []);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Community Norms</CardTitle>
        </div>
        <CardDescription>
          These guidelines help us maintain a positive, reliable, and inclusive gaming community
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="full">Full Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2">
              <NormSummaryCard 
                icon={<Calendar className="h-5 w-5 text-amber-500" />}
                title="Reliability & Accountability"
                description="We value players who honor their commitments"
                items={[
                  "Complete your profile before posting",
                  "72-hour RSVP lock",
                  "24-hour host-cancellation rule"
                ]}
              />
              
              <NormSummaryCard 
                icon={<Users className="h-5 w-5 text-blue-500" />}
                title="Inclusivity & Tone"
                description="GameHub is welcoming to all players"
                items={[
                  "Inclusive language / no gate-keeping",
                  "Attend two sessions before hosting"
                ]}
              />
              
              <NormSummaryCard 
                icon={<Star className="h-5 w-5 text-green-500" />}
                title="Reputation & Feedback"
                description="Building trust through consistent behavior"
                items={[
                  "One-click post-game feedback",
                  "Beginner-friendly tag for sessions"
                ]}
              />
              
              <NormSummaryCard 
                icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                title="Spam & Spoilers"
                description="Keeping our community content valuable"
                items={[
                  "No multichannel spam",
                  "Spoiler-only threads"
                ]}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="full">
            {normsContent ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(normsContent) }} />
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                <span>Loading community norms...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to convert markdown to simple HTML
function renderMarkdownToHTML(markdown: string): string {
  // Very basic markdown to HTML conversion for demonstration
  // In a real implementation, use a proper markdown library
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br /><br />');
  
  return html;
}

// Summary card component
function NormSummaryCard({ icon, title, description, items }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="items">
            <AccordionTrigger className="text-sm font-medium">
              View Norms
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}