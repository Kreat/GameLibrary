import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Calendar, MapPin, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";

// We'll use a simple Timestamp class as Firebase is not available
class Timestamp {
  seconds: number;
  nanoseconds: number;
  
  constructor(seconds: number, nanoseconds: number = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  
  toDate(): Date {
    return new Date(this.seconds * 1000);
  }
  
  static fromDate(date: Date): Timestamp {
    return new Timestamp(Math.floor(date.getTime() / 1000));
  }
}

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

const UpcomingSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't actually fetch from Firebase - just use the placeholders
    // and set loading to false after a brief delay to simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
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
  ];

  const displaySessions = sessions.length > 0 ? sessions : placeholderSessions;

  const getBadgeColor = (gameType: string) => {
    switch (gameType) {
      case "Board Game":
        return "bg-primary";
      case "Card Game":
        return "bg-accent";
      case "Tabletop RPG":
        return "bg-purple-800";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <section className="py-12 bg-stanford-black text-stanford-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-stanford-white">Upcoming Sessions</h2>
            <p className="text-stanford-white/80 mt-2">Join these games happening soon</p>
          </div>
          <Link
            href="/sessions"
            className="text-stanford-red hover:text-stanford-red/80 text-sm font-medium hidden md:flex items-center"
          >
            View all sessions
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 h-14"></div>
                <div className="p-4 flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 h-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-800">
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
                
                <div className="p-4 flex-1">
                  <h3 className="text-lg font-display font-bold mb-2">{session.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{session.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
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
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
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
                  <Button
                    size="sm"
                    asChild
                  >
                    <Link href={user ? `/sessions/${session.id}` : "/auth"}>
                      Join Session
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/sessions"
            className="text-stanford-red hover:text-stanford-red/80 text-sm font-medium flex items-center justify-center"
          >
            View all sessions
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingSessions;
