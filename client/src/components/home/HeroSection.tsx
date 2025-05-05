import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
// import { Users, CalendarDays, Dice5 } from "lucide-react";
import { Users, CalendarDays, MessagesSquare } from "lucide-react";
import { CreateSessionDialog } from "@/components/session/CreateSessionDialog";

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
          {/* Animated title */}
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 animate-fade-in gradient-text">
            GameHub
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90 font-medium animate-fade-in delay-100">
            The ultimate platform for gamers to connect and play
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Card 1*/}
            <Link href="/sessions" className="no-underline">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-meeple/30 card-hover animate-fade-in delay-200 cursor-pointer transition-all hover:shadow-lg hover:border-meeple/50">
                <div className="mb-4 w-16 h-16 bg-gradient-to-br from-meeple to-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-meeple">
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
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-boardRed/30 card-hover animate-fade-in delay-300 cursor-pointer transition-all hover:shadow-lg hover:border-boardRed/50">
                <div className="mb-4 w-16 h-16 bg-gradient-to-br from-boardRed to-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <CalendarDays className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-boardRed">
                  Host a Game
                </h3>
                <p className="text-white/80">
                  Plan and organize your next gaming session with ease
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <Link href="/chat" className="no-underline">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-mintToken/30 card-hover animate-fade-in delay-400 cursor-pointer transition-all hover:shadow-lg hover:border-mintToken/50">
                <div className="mb-4 w-16 h-16 bg-gradient-to-br from-mintToken to-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <MessagesSquare className="h-8 w-8 text-slateNight" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-mintToken">
                  Discover People
                </h3>
                <p className="text-white/80">
                  Chat with fellow gamers real-time and find new friends
                </p>
              </div>
            </Link>
          </div>

          {/* CTA Buttons */}
          {/* <div className="flex flex-wrap gap-8 justify-center animate-fade-in delay-500">
            <Button
              size="lg"
              variant="default"
              className="gradient-bg-primary text-slateNight font-bold px-10 py-7 h-auto rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 text-lg"
              asChild
            >
              <Link href="/sessions">Find Players</Link>
            </Button>
            <CreateSessionDialog 
              buttonSize="lg"
              buttonLabel="Host a Game"
              buttonClassNames="gradient-bg-accent text-slateNight font-bold px-10 py-7 h-auto rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 text-lg btn-glow"
              id="createSessionTrigger"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
