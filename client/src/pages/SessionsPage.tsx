import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  MapPin,
  User,
  Clock,
  Search,
  Calendar as CalendarIcon2,
  Filter,
  Plus,
  Download,
} from "lucide-react";
import { formatDate, generateCalendarEvent, downloadICSFile } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

type Session = {
  id: string;
  title: string;
  description: string;
  gameType: string;
  duration: string;
  startTime: Timestamp;
  endTime: Timestamp;
  location: string;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  maxParticipants: number;
};

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [gameTypeFilter, setGameTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const now = new Date();
        const sessionsCollection = collection(db, "sessions");
        const sessionQuery = query(
          sessionsCollection,
          where("startTime", ">", now)
        );
        
        const querySnapshot = await getDocs(sessionQuery);
        const sessionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];
        
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Placeholder data for when we're not connected to Firebase
  const placeholderSessions: Session[] = [
    {
      id: "1",
      title: "Catan Tournament Night",
      description: "Join us for a fun night of strategic gameplay with Catan and expansions!",
      gameType: "Board Game",
      duration: "2.5 hours",
      startTime: Timestamp.fromDate(new Date(Date.now() + 86400000)), // tomorrow
      endTime: Timestamp.fromDate(new Date(Date.now() + 86400000 + 9000000)), // tomorrow + 2.5h
      location: "Stanford Game Room, Building 42",
      host: {
        id: "host1",
        name: "Kevin K.",
      },
      participants: [
        { id: "p1", name: "Alice" },
        { id: "p2", name: "Bob" },
        { id: "p3", name: "Charlie" },
      ],
      maxParticipants: 5,
    },
    {
      id: "2",
      title: "Magic: The Gathering Draft",
      description: "Casual MTG draft session for players of all skill levels. Cards provided!",
      gameType: "Card Game",
      duration: "1.5 hours",
      startTime: Timestamp.fromDate(new Date(Date.now() + 345600000)), // in 4 days
      endTime: Timestamp.fromDate(new Date(Date.now() + 345600000 + 5400000)), // in 4 days + 1.5h
      location: "Card Kingdom Cafe, The Hub",
      host: {
        id: "host2",
        name: "Chloe J.",
      },
      participants: [
        { id: "p4", name: "Dave" },
        { id: "p5", name: "Eve" },
        { id: "p6", name: "Frank" },
        { id: "p7", name: "Grace" },
      ],
      maxParticipants: 6,
    },
    {
      id: "3",
      title: "D&D 5e - Curse of Strahd",
      description: "Character level 3-5. New campaign starting! Beginner-friendly.",
      gameType: "Tabletop RPG",
      duration: "3 hours",
      startTime: Timestamp.fromDate(new Date(Date.now() + 172800000)), // in 2 days
      endTime: Timestamp.fromDate(new Date(Date.now() + 172800000 + 10800000)), // in 2 days + 3h
      location: "Fantasy Guild Hall, Downtown",
      host: {
        id: "host3",
        name: "Gustavo M.",
      },
      participants: [
        { id: "p8", name: "Hannah" },
        { id: "p9", name: "Ivan" },
      ],
      maxParticipants: 5,
    },
    {
      id: "4",
      title: "Warhammer 40k Battle Night",
      description: "2000 points, bring your painted army. New players welcome with loaner armies available.",
      gameType: "Miniature Game",
      duration: "3 hours",
      startTime: Timestamp.fromDate(new Date(Date.now() + 259200000)), // in 3 days
      endTime: Timestamp.fromDate(new Date(Date.now() + 259200000 + 10800000)), // in 3 days + 3h
      location: "Miniature Wargaming Club, East Campus",
      host: {
        id: "host4",
        name: "Haven W.",
      },
      participants: [
        { id: "p10", name: "Jack" },
        { id: "p11", name: "Kim" },
      ],
      maxParticipants: 6,
    },
    {
      id: "5",
      title: "Betrayal at House on the Hill",
      description: "Explore a haunted mansion until one player becomes the traitor. Spooky fun for Halloween season!",
      gameType: "Board Game",
      duration: "1.5 hours",
      startTime: Timestamp.fromDate(new Date(Date.now() + 432000000)), // in 5 days
      endTime: Timestamp.fromDate(new Date(Date.now() + 432000000 + 5400000)), // in 5 days + 1.5h
      location: "Haunted Game Cafe, North Campus",
      host: {
        id: "host5",
        name: "Lily M.",
      },
      participants: [
        { id: "p12", name: "Nathan" },
        { id: "p13", name: "Olivia" },
        { id: "p14", name: "Paul" },
      ],
      maxParticipants: 6,
    },
  ];

  const displaySessions = sessions.length > 0 ? sessions : placeholderSessions;

  // Filter sessions based on selected date, game type, and search query
  const filteredSessions = displaySessions.filter(session => {
    const sessionDate = session.startTime.toDate();
    const isDateMatch = !selectedDate || 
      (sessionDate.getDate() === selectedDate.getDate() &&
      sessionDate.getMonth() === selectedDate.getMonth() &&
      sessionDate.getFullYear() === selectedDate.getFullYear());
    
    const isGameTypeMatch = gameTypeFilter === "all" || session.gameType.toLowerCase().includes(gameTypeFilter.toLowerCase());
    
    const isSearchMatch = !searchQuery || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isDateMatch && isGameTypeMatch && isSearchMatch;
  });

  const handleExportCalendar = (session: Session) => {
    const icsContent = generateCalendarEvent(session);
    downloadICSFile(icsContent, `${session.title.replace(/\s+/g, '_')}.ics`);
  };

  const getBadgeColor = (gameType: string) => {
    switch (gameType) {
      case "Board Game":
        return "bg-primary";
      case "Card Game":
        return "bg-accent";
      case "Tabletop RPG":
        return "bg-purple-800";
      case "Miniature Game":
        return "bg-emerald-600";
      default:
        return "bg-gray-600";
    }
  };

  // SEO - Set document title
  useEffect(() => {
    document.title = "Find Sessions - GameHub";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Find Gaming Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join upcoming games or create your own
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={user ? "/create-session" : "/profile"}>
              <Plus className="mr-2 h-4 w-4" />
              Host Session
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-lg">Filters</h3>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Date
                </label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md p-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Game Type
                </label>
                <Select 
                  value={gameTypeFilter} 
                  onValueChange={setGameTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="board">Board Games</SelectItem>
                    <SelectItem value="card">Card Games</SelectItem>
                    <SelectItem value="rpg">Tabletop RPGs</SelectItem>
                    <SelectItem value="miniature">Miniature Games</SelectItem>
                    <SelectItem value="party">Party Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input 
                    placeholder="Search sessions..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedDate(undefined);
                  setGameTypeFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs value={view} onValueChange={setView} className="mb-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-1.5">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-1.5">
                  <CalendarIcon2 className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          
            <TabsContent value="list" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 h-14"></div>
                        <div className="p-4 space-y-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 h-16"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-0">
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border-b border-primary-100 dark:border-primary-800/30 flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className={`${getBadgeColor(session.gameType)} text-white`}>
                              {session.gameType}
                            </Badge>
                            <span className="ml-2 text-xs text-primary-700 dark:text-primary-300 font-medium flex items-center">
                              <Clock className="mr-1 h-3 w-3" /> {session.duration}
                            </span>
                          </div>
                          <span className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                            {session.participants.length}/{session.maxParticipants} players
                          </span>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-display font-bold mb-2">{session.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{session.description}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{formatDate(session.startTime.toDate())}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{session.location}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>Hosted by {session.host.name}</span>
                          </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 justify-between items-center">
                          <div className="flex -space-x-2">
                            {session.participants.slice(0, 3).map((participant, index) => (
                              <Avatar key={participant.id} className="h-7 w-7 border-2 border-white dark:border-gray-900">
                                <AvatarImage src={participant.avatar} />
                                <AvatarFallback>{participant.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                            {session.participants.length > 3 && (
                              <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                +{session.participants.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportCalendar(session)}
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              Export
                            </Button>
                            <Button
                              size="sm"
                              asChild
                            >
                              <Link href={user ? `/sessions/${session.id}` : "/profile"}>
                                Join Session
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-display font-bold mb-2">No sessions found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button asChild>
                    <Link href="/create-session">
                      <Plus className="mr-2 h-4 w-4" />
                      Host Your Own Session
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Calendar view coming soon! Please use the list view for now.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Import List at the top to avoid error
import { List } from "lucide-react";

export default SessionsPage;
