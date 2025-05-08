import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert, UserCog, Flag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import UserRoleManagement from "@/components/admin/UserRoleManagement";
import ContentReportManagement from "@/components/admin/ContentReportManagement";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  if (user && user.role !== "admin" && user.role !== "moderator") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin dashboard.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <ShieldAlert className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <UserCog className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            Content Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>
                Assign roles to users. Admins have full access to the system, moderators can manage content reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>
                Review and take action on reported content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentReportManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}