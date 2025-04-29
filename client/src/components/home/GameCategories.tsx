import { Link } from "wouter";
import { ArrowRight, GamepadIcon, FileText, Swords } from "lucide-react";

const categories = [
  {
    id: "board",
    title: "Board Games",
    activeSessions: "230+",
    imageSrc: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <GamepadIcon className="h-6 w-6" />,
    iconBgClass: "bg-primary",
  },
  {
    id: "card",
    title: "Card Games",
    activeSessions: "156+",
    imageSrc: "https://images.unsplash.com/photo-1564149504298-00f45c77d3e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <FileText className="h-6 w-6" />,
    iconBgClass: "bg-accent",
  },
  {
    id: "rpg",
    title: "Tabletop RPGs",
    activeSessions: "180+",
    imageSrc: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    icon: <Swords className="h-6 w-6" />,
    iconBgClass: "bg-purple-800",
  }
];

const GameCategories = () => {
  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Game Categories</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Explore different types of games and find your niche</p>
          </div>
          <Link 
            href="/games" 
            className="text-primary dark:text-primary-foreground hover:text-primary/80 dark:hover:text-primary-foreground/80 text-sm font-medium hidden md:flex items-center"
          >
            View all categories
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/games?category=${category.id}`}>
              <div className="group relative overflow-hidden rounded-xl shadow-md h-64 block">
                <img 
                  src={category.imageSrc} 
                  alt={category.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className={`${category.iconBgClass} text-white rounded-full w-12 h-12 flex items-center justify-center mb-3`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-1">{category.title}</h3>
                  <p className="text-gray-300 text-sm">{category.activeSessions} active sessions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/games"
            className="text-primary dark:text-primary-foreground hover:text-primary/80 dark:hover:text-primary-foreground/80 text-sm font-medium flex items-center justify-center"
          >
            View all categories
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GameCategories;
