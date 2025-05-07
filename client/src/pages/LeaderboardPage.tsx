import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserStats, User } from "@shared/schema";

// A component to render individual leaderboard entries
interface LeaderboardEntryProps {
  stats: UserStats & { user: User };
  index: number;
  showMetric: string;
}

const LeaderboardEntry = ({ stats, index, showMetric }: LeaderboardEntryProps) => {
  const isTopThree = index < 3;
  
  // Define colors for the top 3 positions
  const positionColors = [
    "text-yellow-500", // Gold - 1st place
    "text-slate-400",  // Silver - 2nd place
    "text-amber-700",  // Bronze - 3rd place
  ];
  
  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <div className="flex items-center p-3 border-b last:border-0 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center justify-center w-10">
        {getRankBadge(index)}
      </div>
      
      <div className="flex items-center flex-1 gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={stats.user.photoUrl || undefined} alt={stats.user.username} />
          <AvatarFallback className="bg-primary">{stats.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <span className="font-medium">{stats.user.displayName || stats.user.username}</span>
          <span className="text-sm text-muted-foreground">@{stats.user.username}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showMetric === "host" ? (
          <>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {stats.hostRating}/5
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {stats.sessionsHosted}
            </Badge>
          </>
        ) : (
          <>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {stats.playerRating}/5
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {stats.sessionsJoined}
            </Badge>
          </>
        )}
      </div>
    </div>
  );
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState("hosts");
  
  // Query top hosts
  const { 
    data: topHosts, 
    isLoading: isLoadingHosts 
  } = useQuery({
    queryKey: ["/api/leaderboard/top-hosts"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/top-hosts");
      if (!res.ok) throw new Error("Failed to fetch top hosts");
      return res.json();
    }
  });
  
  // Query top players
  const { 
    data: topPlayers, 
    isLoading: isLoadingPlayers 
  } = useQuery({
    queryKey: ["/api/leaderboard/top-players"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/top-players");
      if (!res.ok) throw new Error("Failed to fetch top players");
      return res.json();
    }
  });
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Discover the top game hosts and players in our community!
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="hosts" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="hosts">Top Hosts</TabsTrigger>
            <TabsTrigger value="players">Top Players</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            This Month
          </Button>
        </div>
        
        <TabsContent value="hosts" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Best Game Hosts</CardTitle>
              <CardDescription>
                Ranked by host rating and number of sessions hosted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHosts ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : topHosts && topHosts.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {topHosts.map((stats, index) => (
                    <LeaderboardEntry
                      key={stats.id}
                      stats={stats}
                      index={index}
                      showMetric="host"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No host data available yet. Start hosting game sessions to appear on the leaderboard!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Best Game Players</CardTitle>
              <CardDescription>
                Ranked by player rating and number of sessions joined
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlayers ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : topPlayers && topPlayers.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {topPlayers.map((stats, index) => (
                    <LeaderboardEntry
                      key={stats.id}
                      stats={stats}
                      index={index}
                      showMetric="player"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No player data available yet. Start joining game sessions to appear on the leaderboard!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPage;