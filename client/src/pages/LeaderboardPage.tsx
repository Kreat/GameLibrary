import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Users, Calendar, TrendingUp } from "lucide-react";
import Leaderboard from "@/components/reputation/Leaderboard";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>("leaderboard");

  return (
    <Container>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Community Leaderboards</h1>
            <p className="text-muted-foreground">
              See who's making the biggest impact in our gaming community
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="leaderboard" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Top Members
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Community Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Leaderboard />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Weekly Highlights
                    </CardTitle>
                    <CardDescription>This week's most active members</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Most Games Hosted</div>
                        <div className="text-sm text-muted-foreground">kwonk</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Most Games Joined</div>
                        <div className="text-sm text-muted-foreground">tjin</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Highest Rated Host</div>
                        <div className="text-sm text-muted-foreground">kwonk</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Most Helpful Player</div>
                        <div className="text-sm text-muted-foreground">alicek</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Star className="h-5 w-5 mr-2 text-primary" />
                      Reputation Info
                    </CardTitle>
                    <CardDescription>How to gain reputation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <p>Reputation is earned by:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Hosting game sessions successfully</li>
                        <li>Receiving positive reviews</li>
                        <li>Participating in community discussions</li>
                        <li>Helping new members</li>
                      </ul>
                      <p className="pt-2">
                        Higher reputation unlocks more features and increases your visibility in the community.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">142</CardTitle>
                  <CardDescription>Active Members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-500 font-medium">↑ 12%</span> from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">87</CardTitle>
                  <CardDescription>Game Sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-500 font-medium">↑ 24%</span> from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">4.7</CardTitle>
                  <CardDescription>Average Rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Based on 219 session reviews
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">53</CardTitle>
                  <CardDescription>Stanford Communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Across 24 different game types
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Most Popular Games
                  </CardTitle>
                  <CardDescription>
                    Games with the most active sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>Dungeons & Dragons</div>
                      <div className="text-sm text-muted-foreground">27 active sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Magic: The Gathering</div>
                      <div className="text-sm text-muted-foreground">19 active sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Catan</div>
                      <div className="text-sm text-muted-foreground">15 active sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Valorant</div>
                      <div className="text-sm text-muted-foreground">12 active sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Among Us</div>
                      <div className="text-sm text-muted-foreground">10 active sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Busiest Days
                  </CardTitle>
                  <CardDescription>
                    When most sessions are scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>Saturday</div>
                      <div className="text-sm text-muted-foreground">32% of all sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Friday</div>
                      <div className="text-sm text-muted-foreground">28% of all sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Sunday</div>
                      <div className="text-sm text-muted-foreground">18% of all sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Wednesday</div>
                      <div className="text-sm text-muted-foreground">10% of all sessions</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>Thursday</div>
                      <div className="text-sm text-muted-foreground">7% of all sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}