import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trophy, Medal, Users, Crown } from "lucide-react";

type UserWithStats = {
  id: number;
  username: string;
  displayName: string | null;
  photoUrl: string | null;
  sessionsHosted: number;
  sessionsJoined: number;
  reputation: number;
  gamesPlayed: number;
  hostRating: number;
  playerRating: number;
  reviewsReceived: number;
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<string>("hosts");

  const { data: leaderboardData, isLoading, error } = useQuery<{
    topHosts: UserWithStats[];
    topPlayers: UserWithStats[];
  }>({
    queryKey: ["/api/user-stats/top"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Function to determine medal based on position
  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="font-bold">{position + 1}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !leaderboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Could not load leaderboard data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the leaderboard. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { topHosts, topPlayers } = leaderboardData;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          GameHub Leaderboard
        </CardTitle>
        <CardDescription>
          See who's making the biggest impact in our gaming community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hosts" className="flex items-center">
              <Crown className="h-4 w-4 mr-2" />
              Top Hosts
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Top Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hosts" className="mt-4 space-y-4">
            {topHosts.length > 0 ? (
              topHosts.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    index === 0
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : "border"
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getMedal(index)}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.photoUrl || undefined} />
                    <AvatarFallback>
                      {user.displayName
                        ? user.displayName.charAt(0)
                        : user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.displayName || user.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Hosted {user.sessionsHosted} sessions
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="font-bold">{user.hostRating.toFixed(1)}</span>
                      <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {user.reputation} rep
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No host data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="players" className="mt-4 space-y-4">
            {topPlayers.length > 0 ? (
              topPlayers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    index === 0
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "border"
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getMedal(index)}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.photoUrl || undefined} />
                    <AvatarFallback>
                      {user.displayName
                        ? user.displayName.charAt(0)
                        : user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.displayName || user.username}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {user.sessionsJoined} sessions
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="font-bold">{user.playerRating.toFixed(1)}</span>
                      <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {user.reputation} rep
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No player data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}