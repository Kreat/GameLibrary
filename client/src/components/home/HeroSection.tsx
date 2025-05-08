import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
// import { Users, CalendarDays, Dice5 } from "lucide-react";
import { Users, CalendarDays, MessagesSquare } from "lucide-react";
import { CreateSessionDialog } from "@/components/session/CreateSessionDialog";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-stanford-black text-stanford-white overflow-hidden">
      {/* Background with animated gradient overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] opacity-10 bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-stanford-black/90 via-stanford-black/80 to-transparent"></div>

      {/* Animated dots pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#8C1515_1px,_transparent_1px)] bg-[length:24px_24px] opacity-10"></div>

      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated title */}
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 animate-fade-in gradient-text-home">
            GameHub
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90 font-medium animate-fade-in delay-100">
            The ultimate platform for gamers to connect and play
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Card 1*/}
            <Link href="/chat" className="no-underline">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-stanfordRed card-hover animate-fade-in delay-400 cursor-pointer transition-all hover:shadow-lg hover:border-glowRed group">
                <div className="mb-4 w-16 h-16 bg-stanfordRed group-hover:bg-glowRed transition-colors duration-450 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-stanfordRed group-hover:text-glowRed transition-colors duration-400">
                  Find Players
                </h3>
                <p className="text-white/80">
                  Connect with players who share your gaming interests
                </p>
              </div>
            </Link>

            {/* Card 2 */}
            <div
              onClick={() =>
                user
                  ? document.getElementById("createSessionTrigger")?.click()
                  : (window.location.href = "/auth")
              }
              className="no-underline"
            >
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-stanfordRed card-hover animate-fade-in delay-400 cursor-pointer transition-all hover:shadow-lg hover:border-glowRed group">
                <div className="mb-4 w-16 h-16 bg-stanfordRed group-hover:bg-glowRed transition-colors duration-450 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <CalendarDays className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-stanfordRed group-hover:text-glowRed transition-colors duration-400">
                  Host a Game
                </h3>
                <p className="text-white/80">
                  Plan and organize your next gaming session with ease
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <Link href="/chat" className="no-underline">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-stanfordRed card-hover animate-fade-in delay-400 cursor-pointer transition-all hover:shadow-lg hover:border-glowRed group">
                {/* NOTE: I prefer gradient over solid red, but I can't get the hover to work right*/}
                {/* <div className="mb-4 w-16 h-16 bg-gradient-to-br from-stanfordRed to-glowRed group-hover:from-glowRed group-hover:to-glowRed rounded-2xl flex items-center justify-center mx-auto shadow-lg"> */}
                 <div className="mb-4 w-16 h-16 bg-stanfordRed group-hover:bg-glowRed transition-colors duration-450 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <MessagesSquare className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-stanfordRed group-hover:text-glowRed transition-colors duration-400">
                  Discover People
                </h3>
                <p className="text-white/80">
                  Chat with fellow gamers real-time and find new friends
                </p>
              </div>
            </Link>
          </div>

          {/* Hidden CreateSessionDialog trigger for the "Host a Game" card */}
          <div className="hidden">
            <CreateSessionDialog 
              id="createSessionTrigger"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
