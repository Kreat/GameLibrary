import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dices, Bell, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { logoutMutation } = useAuth();
  
  const handleSignOut = async () => {
    try {
      logoutMutation.mutate();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/games", label: "Games" },
    { href: "/sessions", label: "Find Sessions" },
    { href: "/community", label: "Community" },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-background dark:bg-slateNight backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex items-center space-x-2 animate-fade-in">
                <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center shadow-md" style={{ transform: 'rotate(15deg)' }}>
                  <Dices className="h-6 w-6 text-slateNight" />
                </div>
                <span className="text-2xl font-display font-bold gradient-text">
                  GameHub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-10 space-x-6">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? "text-meeple dark:text-meeple font-semibold"
                      : "text-foreground dark:text-white/80 hover:text-meeple dark:hover:text-meeple"
                  } px-3 py-2 text-sm font-medium transition-colors relative animate-fade-in`}
                  style={{ animationDelay: `${100 + (index * 100)}ms` }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-meeple rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground dark:text-white/80 hover:text-mintToken dark:hover:text-mintToken animate-fade-in delay-400"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full animate-fade-in delay-500 overflow-hidden border-2 border-meeple hover:border-mintToken transition-colors duration-300"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.photoUrl || undefined}
                        alt={user.displayName || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-meeple to-boardRed text-white font-semibold">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/90 dark:bg-slateNight/90 backdrop-blur-lg border border-meeple/20">
                  <DropdownMenuItem asChild className="hover:bg-meeple/10 dark:hover:bg-meeple/20">
                    <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-mintToken"></span>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="hover:bg-boardRed/10 dark:hover:bg-boardRed/20 cursor-pointer flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-boardRed"></span>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden md:inline-flex gradient-bg-primary text-slateNight font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all animate-fade-in delay-500"
                asChild
              >
                <Link href="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-meeple/10 dark:hover:bg-meeple/20 animate-fade-in delay-500"
                  aria-label="Open mobile menu"
                >
                  <Menu className="h-5 w-5 text-meeple" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background/95 dark:bg-slateNight/95 backdrop-blur-md border-l border-meeple/20">
                <div className="mt-8 flex flex-col space-y-5">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center shadow-md" style={{ transform: 'rotate(15deg)' }}>
                      <Dices className="h-6 w-6 text-slateNight" />
                    </div>
                    <span className="text-2xl font-display font-bold gradient-text">
                      GameHub
                    </span>
                  </div>
                  
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`${
                        isActive(link.href)
                          ? "text-meeple dark:text-meeple font-semibold"
                          : "text-foreground dark:text-white/80 hover:text-meeple dark:hover:text-meeple"
                      } px-4 py-3 text-lg font-medium transition-colors rounded-lg ${isActive(link.href) ? "bg-meeple/10 dark:bg-meeple/20" : "hover:bg-meeple/5 dark:hover:bg-meeple/10"}`}
                      style={{ animationDelay: `${100 + (index * 100)}ms` }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {!user && (
                    <Button
                      variant="default"
                      asChild
                      className="mt-6 gradient-bg-primary text-slateNight font-semibold px-5 py-6 h-auto rounded-xl shadow-md hover:shadow-lg transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/auth">Sign In</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
