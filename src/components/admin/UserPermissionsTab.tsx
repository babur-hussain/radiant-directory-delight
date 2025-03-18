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
import { updateUserRole, updateUserPermission, getAllUsers } from "@/features/auth/userManagement";
import { debugFirestoreUsers, compareUserSources } from "@/lib/firebase-debug";
import UserSubscriptionAssignment from "./UserSubscriptionAssignment";
import { db } from "@/config/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { UserRole } from "@/types/auth";

interface UserPermissionsTabProps {
  onRefresh?: () => void;
  onPermissionError?: (error: any) => void;
}

export const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ 
  onRefresh,
  onPermissionError 
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const firestoreUsers = await debugFirestoreUsers();
      console.log(`Debug: Firestore directly returned ${firestoreUsers.length} users`);
      
      const allUsers = await getAllUsers();
      console.log(`UserPermissionsTab - Loaded ${allUsers.length} users from getAllUsers()`);
      
      await compareUserSources();
      
      allUsers.forEach((user, index) => {
        if (!user.id || !user.email) {
          console.warn(`User at index ${index} is missing required properties:`, user);
        } else {
          console.log(`Tab User ${index + 1}:`, user.id, user.email, user.role, user.isAdmin);
        }
      });
      
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error Loading Users",
        description: "Failed to load user data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Automatically refreshing user data...");
      loadUsers();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const typedRole = newRole as UserRole;
      
      await updateUserRole(user, typedRole);
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role: typedRole } : u
      );
      
      setUsers(updatedUsers);
      
      try {
        const userDoc = doc(db, "users", userId);
        await updateDoc(userDoc, { 
          role: typedRole,
          lastUpdated: serverTimestamp()
        });
        console.log(`✅ User role updated in Firestore: ${typedRole} for ${userId}`);
      } catch (firestoreError) {
        console.error("❌ Firestore update failed:", firestoreError);
      }
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`
      });
      
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
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    try {
      setIsLoading(true);
      
      await updateUserPermission(userId, isAdmin);
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isAdmin } : u
      );
      
      setUsers(updatedUsers);
      
      try {
        const userDoc = doc(db, "users", userId);
        await updateDoc(userDoc, { 
          isAdmin: isAdmin,
          lastUpdated: serverTimestamp()
        });
        console.log(`✅ Admin status updated in Firestore: ${isAdmin} for ${userId}`);
      } catch (firestoreError) {
        console.error("❌ Firestore update failed:", firestoreError);
      }
      
      toast({
        title: "Admin Status Updated",
        description: `User admin status has been ${isAdmin ? 'granted' : 'revoked'}`
      });
      
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
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionAssigned = async (userId: string, packageId: string) => {
    await loadUsers();
    
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        subscriptionPackage: packageId,
        subscriptionAssignedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log(`✅ Subscription assigned in Firestore: ${packageId} to ${userId}`);
    } catch (firestoreError) {
      console.error("❌ Failed to assign subscription in Firestore:", firestoreError);
    }
    
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">User Permissions Management</h3>
        <button 
          onClick={loadUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh Users"}
        </button>
      </div>
      
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
        <p className="text-amber-800 text-sm">
          <strong>User Count:</strong> {users.length} users loaded. 
          {users.length === 0 && !isLoading && " No users found. Try refreshing."}
        </p>
      </div>

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
                      onAssigned={(packageId) => handleSubscriptionAssigned(user.id, packageId)} 
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
