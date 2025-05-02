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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ListFilter,
} from "lucide-react";
import { formatDate, generateCalendarEvent, downloadICSFile, cn } from "@/lib/utils";
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
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);

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
  
  // Function to check if a date has any sessions
  const getSessionsForDate = (date: Date) => {
    if (!date) return [];
    
    return displaySessions.filter(session => {
      const sessionDate = session.startTime.toDate();
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Function to check if a date has any sessions for the calendar
  const hasSessionsOnDate = (date: Date) => {
    return getSessionsForDate(date).length > 0;
  };

  // SEO - Set document title
  useEffect(() => {
    document.title = "Find Sessions - GameHub";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Session Details Dialog */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDateSessions.length} {selectedDateSessions.length === 1 ? "Session" : "Sessions"} on {selectedDate ? formatDate(selectedDate) : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedDateSessions.length > 1 
                ? `Multiple gaming sessions are scheduled for this date` 
                : `Gaming session scheduled for this date`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedDateSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`p-3 ${getBadgeColor(session.gameType)} text-white flex justify-between items-center`}>
                    <div className="flex items-center">
                      <span className="font-medium">{session.gameType}</span>
                      <span className="ml-2 text-xs flex items-center opacity-90">
                        <Clock className="mr-1 h-3 w-3" /> {session.duration}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {session.participants.length}/{session.maxParticipants} players
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold mb-2">{session.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{session.description}</p>
                    
                    <div className="text-xs text-gray-500 flex items-center mb-2">
                      <MapPin className="mr-1.5 h-3 w-3" />
                      <span>{session.location}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <User className="mr-1.5 h-3 w-3" />
                      <span>Hosted by {session.host.name}</span>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportCalendar(session)}
                      >
                        <Download className="mr-1 h-3 w-3" />
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                  onSelect={(date) => {
                    setSelectedDate(date);
                    
                    if (date) {
                      const sessionsOnDate = getSessionsForDate(date);
                      if (sessionsOnDate.length > 0) {
                        setSelectedDateSessions(sessionsOnDate);
                        setShowSessionDetails(true);
                      }
                    }
                  }}
                  className="border rounded-md p-2"
                  classNames={{
                    day_today: "bg-primary/10 font-bold text-primary",
                    day: "relative h-9 w-9 p-0 focus-within:relative focus-within:z-20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                  }}
                  components={{
                    Day: (props) => {
                      const { date, disabled, isOutsideMonth } = props;
                      const sessionsCount = getSessionsForDate(date).length;
                      
                      return (
                        <button
                          onClick={() => props.onClick(date)}
                          disabled={disabled || isOutsideMonth}
                          className={cn(
                            "h-9 w-9 p-0 relative",
                            "aria-selected:bg-primary aria-selected:text-primary-foreground",
                            isOutsideMonth && "text-muted-foreground opacity-50",
                            props.today && "bg-primary/10 text-primary font-medium",
                            props.selected && "bg-primary text-primary-foreground",
                            disabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                          )}
                        >
                          <time dateTime={date.toISOString()}>
                            {date.getDate()}
                          </time>
                          
                          {/* Multiple dots for multiple sessions */}
                          {!disabled && !isOutsideMonth && sessionsCount > 0 && (
                            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
                              {sessionsCount >= 3 ? (
                                <div className="flex items-center gap-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                              ) : sessionsCount === 2 ? (
                                <div className="flex items-center gap-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    }
                  }}
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
                  <ListFilter className="h-4 w-4" />
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
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select a Date</h3>
                      <div className="mb-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            
                            if (date) {
                              const sessionsOnDate = getSessionsForDate(date);
                              if (sessionsOnDate.length > 0) {
                                setSelectedDateSessions(sessionsOnDate);
                                setShowSessionDetails(true);
                              }
                            }
                          }}
                          className="mx-auto border rounded-md p-4"
                          modifiers={{
                            hasSession: (date) => hasSessionsOnDate(date),
                          }}
                          modifiersClassNames={{
                            hasSession: "relative after:absolute after:content-[''] after:w-1.5 after:h-1.5 after:rounded-full after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-primary",
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-center mt-2 text-sm text-gray-500 gap-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                          <span>1 Session</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex gap-0.5 mr-1.5">
                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                          <span>2 Sessions</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex gap-0.5 mr-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                          <span>3+ Sessions</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {selectedDate && getSessionsForDate(selectedDate).length > 0 
                          ? `${getSessionsForDate(selectedDate).length} ${getSessionsForDate(selectedDate).length === 1 ? 'Session' : 'Sessions'} on ${formatDate(selectedDate)}` 
                          : 'No Sessions Selected'}
                      </h3>
                      
                      {selectedDate && getSessionsForDate(selectedDate).length > 0 ? (
                        <div className="space-y-4">
                          {getSessionsForDate(selectedDate).map((session) => (
                            <Card key={session.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className={`p-3 ${getBadgeColor(session.gameType)} text-white flex justify-between items-center`}>
                                  <div className="flex items-center">
                                    <span className="font-medium">{session.gameType}</span>
                                    <span className="ml-2 text-xs flex items-center opacity-90">
                                      <Clock className="mr-1 h-3 w-3" /> {session.duration}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {session.participants.length}/{session.maxParticipants} players
                                  </span>
                                </div>
                                
                                <div className="p-4">
                                  <h4 className="font-bold mb-2">{session.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{session.description}</p>
                                  
                                  <div className="text-xs text-gray-500 flex items-center mb-2">
                                    <MapPin className="mr-1.5 h-3 w-3" />
                                    <span>{session.location}</span>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <User className="mr-1.5 h-3 w-3" />
                                    <span>Hosted by {session.host.name}</span>
                                  </div>
                                  
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleExportCalendar(session)}
                                    >
                                      <Download className="mr-1 h-3 w-3" />
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
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                          <CalendarIcon2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h4 className="text-lg font-medium mb-2">No Sessions Found</h4>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Select a date with a dot indicator to view available gaming sessions
                          </p>
                          <Button asChild variant="outline">
                            <Link href="/create-session">
                              <Plus className="mr-2 h-4 w-4" />
                              Create a Session
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
