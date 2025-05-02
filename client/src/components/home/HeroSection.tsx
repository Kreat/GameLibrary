import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Dice5, Users, CalendarDays } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-slateNight text-white overflow-hidden">
      {/* Background with animated gradient overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] opacity-20 bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slateNight/90 via-slateNight/80 to-transparent"></div>
      
      {/* Animated dots pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#FFD45C_1px,_transparent_1px)] bg-[length:24px_24px] opacity-10"></div>
      
      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated title with green gradient */}
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 animate-fade-in bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
            Welcome to<br/>GameHub
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-indigo-200 font-medium animate-fade-in delay-100">
            Join our community of tabletop game enthusiasts. Find game sessions, connect with players, and discover new games.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Card 1 - Find Games */}
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in delay-200">
              <h3 className="text-2xl font-bold mb-2 text-amber-500">Find Games</h3>
              <p className="text-slate-600">Discover new games and sessions near you</p>
            </div>
            
            {/* Card 2 - Connect */}
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in delay-300">
              <h3 className="text-2xl font-bold mb-2 text-violet-500">Connect</h3>
              <p className="text-slate-600">Meet players with similar interests</p>
            </div>
            
            {/* Card 3 - Organize */}
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in delay-400">
              <h3 className="text-2xl font-bold mb-2 text-emerald-500">Organize</h3>
              <p className="text-slate-600">Schedule and manage your gaming sessions</p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-8 justify-center animate-fade-in delay-500">
            <Button
              size="lg"
              variant="default"
              className="gradient-bg-primary text-slateNight font-bold px-10 py-7 h-auto rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 text-lg"
              asChild
            >
              <Link href="/sessions">Find Players</Link>
            </Button>
            <Button
              size="lg"
              variant="default"
              className="gradient-bg-accent text-slateNight font-bold px-10 py-7 h-auto rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 text-lg btn-glow"
              asChild
            >
              <Link href={user ? "/create-session" : "/auth"}>Host a Game</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
