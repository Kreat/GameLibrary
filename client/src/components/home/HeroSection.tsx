import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-r from-primary to-purple-900 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611264199705-13cad070ffd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] opacity-10 bg-cover bg-center"></div>
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Find Your Next Gaming Group
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            Connect with fellow gamers, schedule sessions, and discover new tabletop experiences.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100 shadow-lg"
              asChild
            >
              <Link href="/sessions">Find Players</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-white hover:bg-primary-foreground/10 shadow-lg"
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
