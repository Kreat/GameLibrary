import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MessageSquare } from "lucide-react";

const CommunityFeatures = () => {
  const features = [
    {
      icon: <Search className="text-primary dark:text-primary-foreground h-6 w-6" />,
      title: "Find Players",
      description: "Connect with players who share your gaming interests and availability."
    },
    {
      icon: <Calendar className="text-primary dark:text-primary-foreground h-6 w-6" />,
      title: "Schedule Events",
      description: "Create and join gaming sessions with our smart scheduling tools."
    },
    {
      icon: <MessageSquare className="text-primary dark:text-primary-foreground h-6 w-6" />,
      title: "Discussion Forums",
      description: "Share strategies, tips, and experiences with fellow enthusiasts."
    }
  ];

  return (
    <section className="py-12 bg-stanford-black text-stanford-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-stanford-white">Join Our Community</h2>
          <p className="text-stanford-white/80 mt-2">Connect with fellow gamers and discover new experiences</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-display font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/community">
              Explore Community Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// Import ArrowRight at the top to avoid error
import { ArrowRight } from "lucide-react";

export default CommunityFeatures;
