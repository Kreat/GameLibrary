import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Medal, Crown, ArrowUpRight, Search, RefreshCcw, 
  Star, UserPlus, Users, Activity
} from "lucide-react";
import { User, UserStats } from "@shared/schema";

const LeaderboardPage = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMetric, setSortMetric] = useState("rating");
  
  const { data: topHosts, isLoading: isLoadingHosts } = useQuery({
    queryKey: ["/api/leaderboard/top-hosts"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard/top-hosts");
      if (!response.ok) {
        throw new Error("Failed to fetch top hosts");
      }
      return response.json();
    },
  });
  
  const { data: topPlayers, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["/api/leaderboard/top-players"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard/top-players");
      if (!response.ok) {
        throw new Error("Failed to fetch top players");
      }
      return response.json();
    },
  });
  
  // Filter and sort by selected metric
  const getFilteredHosts = () => {
    if (!topHosts) return [];
    
    const filtered = searchQuery
      ? topHosts.filter(
          (item) =>
            item.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : topHosts;
    
    return filtered.sort((a, b) => {
      if (sortMetric === "rating") {
        return b.hostRating - a.hostRating;
      } else if (sortMetric === "sessions") {
        return b.sessionsHosted - a.sessionsHosted;
      } else if (sortMetric === "reputation") {
        return b.reputation - a.reputation;
      }
      return 0;
    });
  };
  
  const getFilteredPlayers = () => {
    if (!topPlayers) return [];
    
    const filtered = searchQuery
      ? topPlayers.filter(
          (item) =>
            item.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : topPlayers;
    
    return filtered.sort((a, b) => {
      if (sortMetric === "rating") {
        return b.playerRating - a.playerRating;
      } else if (sortMetric === "sessions") {
        return b.sessionsJoined - a.sessionsJoined;
      } else if (sortMetric === "reputation") {
        return b.reputation - a.reputation;
      }
      return 0;
    });
  };
  
  const filteredHosts = getFilteredHosts();
  const filteredPlayers = getFilteredPlayers();
  
  return (
    <div className="container py-10 max-w-5xl">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Discover top hosts and players in the GameHub community
          </p>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={sortMetric} onValueChange={setSortMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="sessions">Sessions</SelectItem>
              <SelectItem value="reputation">Reputation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="hosts" className="mb-8">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="hosts" className="flex gap-2 items-center">
            <Trophy className="h-4 w-4" />
            Top Hosts
          </TabsTrigger>
          <TabsTrigger value="players" className="flex gap-2 items-center">
            <Star className="h-4 w-4" />
            Top Players
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hosts">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Host Leaderboard</CardTitle>
              <CardDescription>
                Users ranked by hosting quality, frequency, and reputation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHosts ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-10 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredHosts.length > 0 ? (
                <div className="space-y-3">
                  {filteredHosts.map((stats, index) => (
                    <LeaderboardHostEntry
                      key={stats.userId}
                      stats={stats}
                      index={index}
                      showMetric={sortMetric}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hosts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Player Leaderboard</CardTitle>
              <CardDescription>
                Users ranked by sportsmanship, participation, and reputation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlayers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-10 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredPlayers.length > 0 ? (
                <div className="space-y-3">
                  {filteredPlayers.map((stats, index) => (
                    <LeaderboardPlayerEntry
                      key={stats.userId}
                      stats={stats}
                      index={index}
                      showMetric={sortMetric}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No players found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface LeaderboardEntryProps {
  stats: UserStats & { user: User };
  index: number;
  showMetric: string;
}

const LeaderboardHostEntry = ({ stats, index, showMetric }: LeaderboardEntryProps) => {
  const [, setLocation] = useLocation();
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
        {getPositionIcon(index) || <span className="text-sm font-medium">{index + 1}</span>}
      </div>
      
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={stats.user.photoUrl || undefined} alt={stats.user.displayName || stats.user.username} />
        <AvatarFallback>
          {stats.user.displayName?.[0] || stats.user.username[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {stats.user.displayName || stats.user.username}
          </p>
          {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>{stats.hostRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{stats.sessionsHosted}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="flex items-center">
          {showMetric === "rating" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.hostRating.toFixed(1)}</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          )}
          {showMetric === "sessions" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.sessionsHosted}</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
          )}
          {showMetric === "reputation" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.reputation}</span>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 px-2"
          onClick={() => setLocation(`/profile?id=${stats.userId}`)}
        >
          <span className="text-xs">View profile</span>
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const LeaderboardPlayerEntry = ({ stats, index, showMetric }: LeaderboardEntryProps) => {
  const [, setLocation] = useLocation();
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
        {getPositionIcon(index) || <span className="text-sm font-medium">{index + 1}</span>}
      </div>
      
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={stats.user.photoUrl || undefined} alt={stats.user.displayName || stats.user.username} />
        <AvatarFallback>
          {stats.user.displayName?.[0] || stats.user.username[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {stats.user.displayName || stats.user.username}
          </p>
          {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{stats.playerRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            <span>{stats.sessionsJoined}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="flex items-center">
          {showMetric === "rating" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.playerRating.toFixed(1)}</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          )}
          {showMetric === "sessions" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.sessionsJoined}</span>
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
          )}
          {showMetric === "reputation" && (
            <div className="flex items-center gap-1 font-medium">
              <span>{stats.reputation}</span>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 px-2"
          onClick={() => setLocation(`/profile?id=${stats.userId}`)}
        >
          <span className="text-xs">View profile</span>
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardPage;