import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trophy, Star, Users, UserPlus, CircleUser, ShieldCheck } from "lucide-react";
import { UserStats } from "@shared/schema";

interface UserStatsCardProps {
  userId: number;
}

const UserStatsCard = ({ userId }: UserStatsCardProps) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: [`/api/user-stats/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/user-stats/${userId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // If stats don't exist yet, return default empty stats
          return {
            userId,
            hostRating: 0,
            playerRating: 0,
            sessionsHosted: 0,
            sessionsJoined: 0,
            gamesPlayed: 0,
            reputation: 0,
            reviewsReceived: 0
          };
        }
        throw new Error("Failed to fetch user stats");
      }
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Stats</CardTitle>
          <CardDescription>Gaming achievements and reputation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Stats</CardTitle>
          <CardDescription>Gaming achievements and reputation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            <p>Failed to load user statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHostRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent Host";
    if (rating >= 4) return "Great Host";
    if (rating >= 3.5) return "Good Host";
    if (rating >= 3) return "Regular Host";
    if (rating > 0) return "New Host";
    return "Not Rated";
  };

  const getPlayerRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent Player";
    if (rating >= 4) return "Great Player";
    if (rating >= 3.5) return "Good Player";
    if (rating >= 3) return "Regular Player";
    if (rating > 0) return "New Player";
    return "Not Rated";
  };

  const getReputationLabel = (reputation: number) => {
    if (reputation >= 100) return "Distinguished";
    if (reputation >= 50) return "Respected";
    if (reputation >= 25) return "Trusted";
    if (reputation >= 10) return "Known";
    return "New Member";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Gaming Profile</CardTitle>
        <CardDescription>Gaming achievements and reputation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Host Rating</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-semibold">
                    {stats.hostRating ? stats.hostRating : "-"}
                  </span>
                  {stats.hostRating > 0 && <span className="text-sm text-muted-foreground">/5</span>}
                </div>
                <p className="text-xs text-muted-foreground">{getHostRatingLabel(stats.hostRating)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Player Rating</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-semibold">
                    {stats.playerRating ? stats.playerRating : "-"}
                  </span>
                  {stats.playerRating > 0 && <span className="text-sm text-muted-foreground">/5</span>}
                </div>
                <p className="text-xs text-muted-foreground">{getPlayerRatingLabel(stats.playerRating)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Games Hosted</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-semibold">{stats.sessionsHosted}</span>
                <p className="text-xs text-muted-foreground">
                  {stats.sessionsHosted === 0
                    ? "No sessions hosted yet"
                    : stats.sessionsHosted === 1
                    ? "1 session hosted"
                    : `${stats.sessionsHosted} sessions hosted`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Games Joined</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-semibold">{stats.sessionsJoined}</span>
                <p className="text-xs text-muted-foreground">
                  {stats.sessionsJoined === 0
                    ? "No sessions joined yet"
                    : stats.sessionsJoined === 1
                    ? "1 session joined"
                    : `${stats.sessionsJoined} sessions joined`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Reputation</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-semibold">{stats.reputation}</span>
                <p className="text-xs text-muted-foreground">{getReputationLabel(stats.reputation)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Reviews</p>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <CircleUser className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-semibold">{stats.reviewsReceived}</span>
                <p className="text-xs text-muted-foreground">
                  {stats.reviewsReceived === 0
                    ? "No reviews yet"
                    : stats.reviewsReceived === 1
                    ? "1 review received"
                    : `${stats.reviewsReceived} reviews received`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;