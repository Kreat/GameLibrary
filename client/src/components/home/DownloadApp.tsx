// note: we deleted this from HomePage.tsx because we don't have a mobile app
// so this page does nothing

import { Button } from "@/components/ui/button";
import { Apple, PlaySquare } from "lucide-react";

const DownloadApp = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary to-purple-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Take GameHub On The Go</h2>
            <p className="text-primary-foreground/80 mb-6">
              Download our mobile app to find games, schedule sessions, and connect with players anywhere, anytime.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="bg-black hover:bg-gray-900 border-black text-white">
                <Apple className="mr-2 h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs">Download on the</span>
                  <span className="text-sm font-medium">App Store</span>
                </div>
              </Button>
              
              <Button variant="outline" className="bg-black hover:bg-gray-900 border-black text-white">
                <PlaySquare className="mr-2 h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-xs">Get it on</span>
                  <span className="text-sm font-medium">Google Play</span>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-auto">
              <img 
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Mobile App Screenshot" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
