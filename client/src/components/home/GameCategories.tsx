import { Link } from "wouter";
import { ArrowRight, GamepadIcon, FileText, Swords, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    id: "board",
    title: "Board Games",
    activeSessions: "230+",
    description: "Strategy, resource management, and tile placement games",
    imageSrc: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <GamepadIcon className="h-6 w-6" />,
    iconBgClass: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "card",
    title: "Card Games",
    activeSessions: "156+",
    description: "Collectible card games, deck builders, and traditional card games",
    imageSrc: "https://images.unsplash.com/photo-1564149504298-00f45c77d3e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <FileText className="h-6 w-6" />,
    iconBgClass: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "rpg",
    title: "Tabletop RPGs",
    activeSessions: "180+",
    description: "Role-playing games with storytelling and character development",
    imageSrc: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <Swords className="h-6 w-6" />,
    iconBgClass: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  }
];

const GameCategories = () => {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 px-3 py-1">Browse Categories</Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-4">
            Find Your Game Style
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore different types of tabletop games and discover new experiences to share with friends
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {categories.map((category) => (
            <Link key={category.id} href={`/games?category=${category.id}`}>
              <div className={`group relative overflow-hidden rounded-2xl shadow-sm border ${category.borderColor} ${category.bgColor} hover:shadow-md transition-all duration-300 h-full`}>
                <div className="p-6">
                  <div className={`${category.iconBgClass} text-white rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-800 mb-2">{category.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">{category.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-600">{category.activeSessions} active sessions</span>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Explore all game categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GameCategories;
