import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRouter } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import UserRoleManagement from "@/components/admin/UserRoleManagement";
import ContentReportManagement from "@/components/admin/ContentReportManagement";
import { Shield, Users, Flag, AlertCircle } from "lucide-react";

const AdminPage = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  // Redirect if not admin or moderator
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    navigate("/");
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">User Management</span>
            <span className="md:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <Flag className="h-4 w-4" />
            <span className="hidden md:inline">Content Reports</span>
            <span className="md:hidden">Reports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">User Role Management</h2>
              <p className="text-muted-foreground mt-1">
                Update user roles to manage permission levels across the platform.
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <UserRoleManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Content Reports</h2>
              <p className="text-muted-foreground mt-1">
                Review and take action on reported content across the platform.
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <ContentReportManagement />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Admin permissions notice */}
      <div className="mt-8 p-4 bg-muted rounded-md border border-border flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Admin Access Level: {user?.role}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "admin" 
              ? "You have full administrative privileges and can perform all actions." 
              : "You have moderation privileges but some actions may be restricted to admins only."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;