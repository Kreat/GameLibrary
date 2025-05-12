import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Award, Users, Calendar, Trophy, Medal } from "lucide-react";

type UserStatsProps = {
  userId: number;
  username: string;
  displayName?: string | null;
};

type UserStatsData = {
  sessionsHosted: number;
  sessionsJoined: number;
  reputation: number;
  gamesPlayed: number;
  hostRating: number;
  playerRating: number;
  reviewsReceived: number;
  recentReviews: Array<{
    id: number;
    rating: number;
    content: string | null;
    isHostReview: boolean;
    createdAt: string;
    reviewer: {
      username: string;
      displayName: string | null;
    };
  }>;
};

export default function UserStatsCard({ userId, username, displayName }: UserStatsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const { data: stats, isLoading, error } = useQuery<UserStatsData>({
    queryKey: [`/api/users/${userId}/stats`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Stats</CardTitle>
          <CardDescription>
            Could not load stats for {displayName || username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the user's stats. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages for ratings
  const hostRatingPercent = (stats.hostRating / 5) * 100;
  const playerRatingPercent = (stats.playerRating / 5) * 100;
  
  // Function to determine reputation badge
  const getReputationBadge = (reputation: number) => {
    if (reputation >= 100) return { label: "Legendary", color: "bg-yellow-300 text-black" };
    if (reputation >= 80) return { label: "Expert", color: "bg-purple-600 text-white" };
    if (reputation >= 60) return { label: "Veteran", color: "bg-blue-600 text-white" };
    if (reputation >= 40) return { label: "Experienced", color: "bg-green-600 text-white" };
    if (reputation >= 20) return { label: "Rookie", color: "bg-orange-500 text-white" };
    return { label: "Newcomer", color: "bg-gray-500 text-white" };
  };
  
  const reputationBadge = getReputationBadge(stats.reputation);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Reputation & Stats</CardTitle>
            <CardDescription>
              Gaming activity and reputation for {displayName || username}
            </CardDescription>
          </div>
          <Badge className={reputationBadge.color}>
            {reputationBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Reputation:</span>
              <span className="ml-2">{stats.reputation} points</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Games Played</span>
                </div>
                <p className="text-xl font-bold">{stats.gamesPlayed}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sessions Joined</span>
                </div>
                <p className="text-xl font-bold">{stats.sessionsJoined}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sessions Hosted</span>
                </div>
                <p className="text-xl font-bold">{stats.sessionsHosted}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Reviews Received</span>
                </div>
                <p className="text-xl font-bold">{stats.reviewsReceived}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ratings" className="mt-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Host Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{stats.hostRating.toFixed(1)}</span>
                  <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
              <Progress value={hostRatingPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on ratings when hosting game sessions
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Player Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{stats.playerRating.toFixed(1)}</span>
                  <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
              <Progress value={playerRatingPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on ratings when participating in game sessions
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Medal className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">Reputation Points</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Earned through positive reviews, hosting successful sessions, and consistent participation
              </p>
              <div className="text-2xl font-bold">{stats.reputation}</div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            {stats.recentReviews && stats.recentReviews.length > 0 ? (
              <div className="space-y-4">
                {stats.recentReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{review.reviewer.displayName || review.reviewer.username}</div>
                      <div className="flex items-center">
                        <span className="font-bold">{review.rating}</span>
                        <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                      </div>
                    </div>
                    
                    <Badge variant="outline">
                      {review.isHostReview ? "Host Review" : "Player Review"}
                    </Badge>
                    
                    {review.content && (
                      <p className="text-sm text-muted-foreground">
                        "{review.content}"
                      </p>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}