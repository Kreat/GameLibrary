import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Dice5, Users, CalendarDays } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
      <div className="container mx-auto px-4 py-20 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-white drop-shadow-md">
            GameHub
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white font-medium drop-shadow">
            The ultimate platform for tabletop enthusiasts to connect and play
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="mb-4 w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Find Players</h3>
              <p className="text-sm text-white/80">Connect with players who share your gaming interests</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="mb-4 w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Schedule Games</h3>
              <p className="text-sm text-white/80">Plan and organize your next gaming session with ease</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="mb-4 w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto">
                <Dice5 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Discover Games</h3>
              <p className="text-sm text-white/80">Explore new tabletop games and find local events</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Button
              size="lg"
              variant="default"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-6 h-auto rounded-full shadow-lg transition-all"
              asChild
            >
              <Link href="/sessions">Find Players</Link>
            </Button>
            <Button
              size="lg"
              variant="default"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-6 h-auto rounded-full shadow-lg transition-all"
              asChild
            >
              <Link href={user ? "/create-session" : "/profile"}>Host a Game</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
