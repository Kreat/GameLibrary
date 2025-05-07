import { Link } from "wouter";
import { Gamepad, Twitter, Facebook, Instagram, MessagesSquare } from "lucide-react";
import { CreateSessionDialog } from "@/components/session/CreateSessionDialog";
import { useAuth } from "@/hooks/use-auth";

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="bg-stanford-black text-stanford-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-stanford-red rounded-lg flex items-center justify-center">
                <Gamepad className="h-5 w-5 text-stanford-white" />
              </div>
              <span className="text-xl font-display font-bold text-stanford-white">GameHub</span>
            </div>
            <p className="text-sm text-stanford-white/70 mb-4">
              Find your next gaming group and make unforgettable memories with fellow tabletop enthusiasts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">
                <MessagesSquare className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-stanford-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Find Games</Link></li>
              <li>
                <span 
                  onClick={() => {
                    window.scrollTo(0, 0);
                    user ? document.getElementById('footerCreateSessionTrigger')?.click() : window.location.href = '/auth'
                  }}
                  className="text-stanford-white/70 hover:text-stanford-white transition-colors cursor-pointer"
                >
                  Host a Game
                </span>
                <div className="hidden">
                  <CreateSessionDialog id="footerCreateSessionTrigger" buttonLabel="Host a Game" />
                </div>
              </li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/community" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Community Forums</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Game Library</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/sessions" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Event Calendar</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-stanford-white font-medium mb-4">Game Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games?category=board" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Board Games</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games?category=card" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Card Games</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games?category=rpg" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Tabletop RPGs</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games?category=miniature" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Miniature Games</Link></li>
              <li><Link onClick={() => window.scrollTo(0, 0)} href="/games?category=party" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Party Games</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-stanford-white font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Safety Tips</a></li>
              <li><a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="text-stanford-white/70 hover:text-stanford-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stanford-red/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-stanford-white/50 mb-4 md:mb-0">&copy; {new Date().getFullYear()} GameHub. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-stanford-white/50 hover:text-stanford-white transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-stanford-white/50 hover:text-stanford-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-stanford-white/50 hover:text-stanford-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
