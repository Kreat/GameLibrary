import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Calendar, MapPin, Gamepad2, Mail } from "lucide-react";
import UserStatsCard from "@/components/reputation/UserStatsCard";
import { User } from "@shared/schema";
import { Container } from "@/components/ui/container";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Fetch user data
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // If user is not found or there's an error, show error state
  if (profileError) {
    return (
      <Container className="py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The user profile you are looking for does not exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  // Loading state
  if (isLoadingProfile || !profile) {
    return (
      <Container className="py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - User info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.photoUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {profile.displayName 
                    ? profile.displayName.charAt(0) 
                    : profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {profile.displayName || profile.username}
                </CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
                {profile.role && profile.role !== "user" && (
                  <Badge variant="secondary" className="mt-1">
                    {profile.role === "admin" ? "Admin" : "Moderator"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
                
                {profile.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.favoriteGames && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    <span>{profile.favoriteGames}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {currentUser && currentUser.id === parseInt(userId) && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    // TODO: Implement Edit Profile functionality
                    alert('Edit profile functionality coming soon!');
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
          
          <UserStatsCard 
            userId={parseInt(userId)} 
            username={profile.username}
            displayName={profile.displayName}
          />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="sessions">Game Sessions</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.bio ? (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {profile.displayName || profile.username} hasn't added a bio yet.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Additional profile information can be added here */}
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hosted Sessions</CardTitle>
                  <CardDescription>
                    Game sessions hosted by {profile.displayName || profile.username}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    Session history coming soon...
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Joined Sessions</CardTitle>
                  <CardDescription>
                    Game sessions {profile.displayName || profile.username} has participated in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    Session history coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    Activity feed coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
}