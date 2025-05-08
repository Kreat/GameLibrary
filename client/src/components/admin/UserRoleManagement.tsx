import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// User type from server
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  role: string | null;
  createdAt: string;
}

export default function UserRoleManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user role");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle role change
  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.displayName || "-"}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin" 
                      ? "bg-red-100 text-red-800" 
                      : user.role === "moderator" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role || "user"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Select
                      defaultValue={user.role || "user"}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateRoleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                {searchQuery ? "No users match your search." : "No users found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}