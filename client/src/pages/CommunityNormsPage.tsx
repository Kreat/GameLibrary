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
    <Container className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            GameHub Community Norms
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our guidelines for creating a positive, reliable, and inclusive gaming community
          </p>
        </div>
        
        <CommunityNorms />
        
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <WhyNormsCard />
          <HowNormsWorkCard />
        </div>
      </div>
    </Container>
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