import { useEffect } from "react";
import { CommunityNorms } from "@/components/community/CommunityNorms";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MessageSquare, Calendar, Clock, Star } from "lucide-react";

export default function CommunityNormsPage() {
  // SEO - Set document title
  useEffect(() => {
    document.title = "Community Norms - GameHub";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="bg-gradient-to-r from-stanfordRed to-stanfordGreen text-white py-14">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
              Community Norms
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto animate-fade-in opacity-90">
              Our guidelines for creating a positive, reliable, and inclusive gaming community
            </p>
          </div>
        </Container>
      </div>
      
      <Container className="py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="bg-gradient-to-br from-card/80 to-card rounded-xl shadow-lg border border-primary/5 overflow-hidden animate-fade-up">
            <div className="p-6 md:p-8">
              <CommunityNorms />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <WhyNormsCard />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
              <HowNormsWorkCard />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function WhyNormsCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Why We Have Community Norms</CardTitle>
        </div>
        <CardDescription>
          Building a healthy gaming community requires clear expectations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NormPointWithIcon 
          icon={<Users className="h-5 w-5 text-blue-500" />}
          title="Trust & Reliability"
          description="Game sessions are more enjoyable when everyone honors their commitments and shows up when they say they will."
        />
        
        <NormPointWithIcon 
          icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
          title="Inclusive Atmosphere"
          description="We want GameHub to be welcoming to players of all experience levels, backgrounds, and game preferences."
        />
        
        <NormPointWithIcon 
          icon={<Star className="h-5 w-5 text-amber-500" />}
          title="Quality Experiences"
          description="Our norms ensure that game sessions are well-organized and enjoyable for everyone involved."
        />
      </CardContent>
    </Card>
  );
}

function HowNormsWorkCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>How Our Norms Work</CardTitle>
        </div>
        <CardDescription>
          Enforcement is designed to be lightweight yet effective
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NormPointWithIcon 
          icon={<Calendar className="h-5 w-5 text-green-500" />}
          title="Reputation System"
          description="Your reliability and behavior contribute to your reputation score, which is visible to other users."
        />
        
        <NormPointWithIcon 
          icon={<Shield className="h-5 w-5 text-red-500" />}
          title="Automated Safeguards"
          description="Our platform automatically enforces certain norms, like the 72-hour RSVP lock and no-spam policy."
        />
        
        <NormPointWithIcon 
          icon={<Users className="h-5 w-5 text-teal-500" />}
          title="Community Moderation"
          description="Our moderators help enforce norms when necessary, with a focus on education rather than punishment."
        />
      </CardContent>
    </Card>
  );
}

function NormPointWithIcon({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}