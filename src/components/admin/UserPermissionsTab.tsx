
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { updateUserRole, updateUserPermission } from "@/features/auth/userManagement";
import { loadAllUsers } from "@/features/auth/authStorage";
import UserSubscriptionAssignment from "./UserSubscriptionAssignment";

interface UserPermissionsTabProps {
  onRefresh?: () => void;
}

export const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setIsLoading(true);
    const allUsers = loadAllUsers();
    setUsers(allUsers);
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      await updateUserRole(user, newRole);
      
      // Update the local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`
      });
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Update Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    try {
      setIsLoading(true);
      
      await updateUserPermission(userId, isAdmin);
      
      // Update the local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isAdmin } : u
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: "Admin Status Updated",
        description: `User admin status has been ${isAdmin ? 'granted' : 'revoked'}`
      });
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({
        title: "Update Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionAssigned = () => {
    // Refresh the users list to get updated subscription data
    loadUsers();
    
    // Call onRefresh if provided
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Subscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || "User"}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Influencer">Influencer</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isAdmin}
                        onCheckedChange={(checked) => handleAdminToggle(user.id, checked)}
                        disabled={isLoading}
                      />
                      <span>
                        {user.isAdmin ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            No
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserSubscriptionAssignment 
                      user={user} 
                      onAssigned={handleSubscriptionAssigned} 
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {isLoading ? "Loading..." : "No users found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
