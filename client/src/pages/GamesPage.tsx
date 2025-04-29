import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Gamepad, FileText, Swords, Target, Users } from "lucide-react";

const gameTypes = [
  { id: "all", label: "All Games", icon: <Gamepad className="h-4 w-4" /> },
  { id: "board", label: "Board Games", icon: <Gamepad className="h-4 w-4" /> },
  { id: "card", label: "Card Games", icon: <FileText className="h-4 w-4" /> },
  { id: "rpg", label: "Tabletop RPGs", icon: <Swords className="h-4 w-4" /> },
  { id: "miniature", label: "Miniature Games", icon: <Target className="h-4 w-4" /> },
  { id: "party", label: "Party Games", icon: <Users className="h-4 w-4" /> },
];

// Sample data for games
const gamesData = [
  {
    id: 1,
    title: "Catan",
    type: "board",
    players: "3-4",
    playTime: "60-120 min",
    complexity: "Medium",
    description: "Build settlements, cities, and roads as you compete for resources in this classic strategy game.",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Magic: The Gathering",
    type: "card",
    players: "2+",
    playTime: "20-60 min",
    complexity: "High",
    description: "Collect cards, build decks, and battle opponents in this strategic trading card game.",
    image: "https://images.unsplash.com/photo-1595306407462-283c7898c3f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Dungeons & Dragons",
    type: "rpg",
    players: "3-7",
    playTime: "2-4 hours",
    complexity: "High",
    description: "Create characters, embark on adventures, and tell collaborative stories in this iconic role-playing game.",
    image: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Warhammer 40,000",
    type: "miniature",
    players: "2",
    playTime: "2-3 hours",
    complexity: "High",
    description: "Command armies in tactical battle across a grim, dark future where there is only war.",
    image: "https://images.unsplash.com/photo-1615371165649-d6875619fdf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Codenames",
    type: "party",
    players: "4-8+",
    playTime: "15-30 min",
    complexity: "Low",
    description: "Give one-word clues to help your team identify your agents while avoiding the assassin.",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Ticket to Ride",
    type: "board",
    players: "2-5",
    playTime: "30-60 min",
    complexity: "Medium",
    description: "Collect cards, claim railway routes, and connect cities across North America.",
    image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

const GamesPage = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredGames, setFilteredGames] = useState(gamesData);

  // Get category from URL params if any
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    if (category) {
      setActiveTab(category);
    }
  }, [location]);

  // Filter games based on activeTab and searchQuery
  useEffect(() => {
    let filtered = gamesData;
    
    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter(game => game.type === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(query) || 
        game.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredGames(filtered);
  }, [activeTab, searchQuery]);

  // SEO - Set document title
  useEffect(() => {
    document.title = "Games - GameHub";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Games Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover new games and find your next favorite</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input 
              placeholder="Search games..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:grid-cols-6 h-auto gap-2">
          {gameTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center gap-1.5 py-2"
            >
              {type.icon}
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {gameTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="mt-6">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map(game => (
                  <Card key={game.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        {gameTypes.find(t => t.id === game.type)?.label.replace(" Games", "")}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-display font-bold mb-2">{game.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {game.players} players
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {game.playTime}
                        </span>
                        <span>{game.complexity} Complexity</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {game.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-display font-bold mb-2">No games found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Import Clock at the top to avoid error
import { Clock } from "lucide-react";

export default GamesPage;
