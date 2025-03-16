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
import { updateUserRole, updateUserPermission, getAllUsers, ensureTestUsers } from "@/features/auth/userManagement";
import { debugFirestoreUsers, compareUserSources } from "@/lib/firebase-debug";
import UserSubscriptionAssignment from "./UserSubscriptionAssignment";
import { db } from "@/config/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { connectToMongoDB } from "@/config/mongodb";

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
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkMongoConnection();
    loadUsers();
  }, []);

  const checkMongoConnection = async () => {
    try {
      const connected = await connectToMongoDB();
      console.log("MongoDB connection test result:", connected);
      setMongoConnected(connected);
      
      if (!connected) {
        setLoadingError("Cannot connect to MongoDB. Please check your connection settings.");
      }
    } catch (error) {
      console.error("Error checking MongoDB connection:", error);
      setMongoConnected(false);
      setLoadingError("Error checking MongoDB connection: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const createTestUsersIfEmpty = async () => {
    try {
      setIsLoading(true);
      await ensureTestUsers();
      await loadUsers();
      toast({
        title: "Test Users Created",
        description: "Sample users have been created successfully",
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      toast({
        title: "Error Creating Test Users",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      console.log("Starting to load users...");
      
      // First test MongoDB connection
      const connected = await connectToMongoDB();
      setMongoConnected(connected);
      
      if (!connected) {
        throw new Error("Cannot connect to MongoDB. Please check your connection settings.");
      }
      
      console.log("Attempting to load users from MongoDB via getAllUsers()...");
      const allUsers = await getAllUsers();
      console.log(`UserPermissionsTab - Loaded ${allUsers.length} users from getAllUsers()`);
      
      if (allUsers && allUsers.length > 0) {
        setUsers(allUsers);
      } else {
        console.warn("No users returned from getAllUsers()");
        setLoadingError("No users found in database");
      }
    } catch (error) {
      console.error("Error loading users (FULL ERROR):", error);
      
      // Extract detailed error message
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
        if (error.stack) {
          console.error("Error stack:", error.stack);
        }
      } else {
        errorMessage = String(error);
      }
      
      setLoadingError(errorMessage);
      
      toast({
        title: "Error Loading Users",
        description: "Failed to load user data. See console for details.",
        variant: "destructive"
      });
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="flex gap-2">
          <Button 
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh Users"}
          </Button>
          {users.length === 0 && (
            <Button 
              onClick={createTestUsersIfEmpty}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={isLoading}
            >
              Create Test Users
            </Button>
          )}
        </div>
      </div>
      
      {mongoConnected === false && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>MongoDB Connection Failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Cannot connect to MongoDB. Please check your connection URI and network settings.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={checkMongoConnection}
              className="mt-2"
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {loadingError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Failed to load users</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{loadingError}</p>
            <p className="text-sm">
              Check the browser console for more detailed error information.
              This could be due to MongoDB connection issues or missing permissions.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
        <p className="text-amber-800 text-sm">
          <strong>MongoDB Status:</strong> {mongoConnected === true ? "Connected" : mongoConnected === false ? "Disconnected" : "Unknown"}
          <br />
          <strong>User Count:</strong> {users.length} users loaded. 
          {users.length === 0 && !isLoading && " No users found. Try refreshing or creating test users."}
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
