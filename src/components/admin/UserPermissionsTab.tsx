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
import { useToast } from "@/hooks/use-toast";
import { updateUserRole, updateUserPermission } from "@/features/auth/roleManagement";
import { getAllUsers } from "@/features/auth/userDataAccess";
import { generateTestUsers } from "@/features/auth/testUsers";
import UserSubscriptionAssignment from "./UserSubscriptionAssignment";
import { UserRole } from "@/types/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { connectToMongoDB } from "@/config/mongodb";
import { AlertCircle, Loader2, RefreshCw, UserCheck } from "lucide-react";
import axios from "axios";

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
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkMongoConnection();
    loadUsers();
  }, []);

  const checkMongoConnection = async () => {
    try {
      const connected = await connectToMongoDB();
      setMongoConnected(connected);
      
      if (!connected) {
        setLoadingError("Cannot connect to MongoDB. Please check your connection settings.");
      }
    } catch (error) {
      setMongoConnected(false);
      setLoadingError("Error checking MongoDB connection: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const createTestUsersIfEmpty = async () => {
    try {
      setIsLoading(true);
      await generateTestUsers(5, 'User' as UserRole);
      await generateTestUsers(5, 'Business');
      await generateTestUsers(5, 'Influencer');
      await generateTestUsers(1, 'Admin');
      
      await loadUsers();
      toast({
        title: "Test Users Created",
        description: "Sample users have been created successfully",
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      setLoadingError("Failed to create test users: " + (error instanceof Error ? error.message : String(error)));
      
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
      const connected = await connectToMongoDB();
      setMongoConnected(connected);
      
      if (!connected) {
        throw new Error("Cannot connect to MongoDB. Please check your connection settings.");
      }
      
      const result = await getAllUsers();
      const allUsers = result.users;
      
      if (allUsers && allUsers.length > 0) {
        const sortedUsers = [...allUsers].sort((a, b) => {
          const nameA = a.name || a.displayName || a.email || '';
          const nameB = b.name || b.displayName || b.email || '';
          return nameA.localeCompare(nameB);
        });
        
        setUsers(sortedUsers);
      } else {
        setLoadingError("No users found in database");
      }
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
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
      setUpdatingUserId(userId);
      const user = users.find(u => u.id === userId || u.uid === userId);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const typedRole = newRole as UserRole;

      await updateUserRole({
        ...user,
        role: typedRole
      });
      
      const updatedUsers = users.map(u => 
        (u.id === userId || u.uid === userId) ? { ...u, role: typedRole } : u
      );
      
      setUsers(updatedUsers);
      
      try {
        await axios.post('http://localhost:3001/api/users', {
          id: userId,
          role: typedRole,
          lastUpdated: new Date()
        });
      } catch (mongoError) {
        console.error("❌ MongoDB update failed:", mongoError);
      }
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    try {
      setUpdatingUserId(userId);
      
      await updateUserPermission(userId, isAdmin);
      
      const updatedUsers = users.map(u => 
        (u.id === userId || u.uid === userId) ? { ...u, isAdmin } : u
      );
      
      setUsers(updatedUsers);
      
      try {
        await axios.post('http://localhost:3001/api/users', {
          id: userId,
          isAdmin: isAdmin,
          lastUpdated: new Date()
        });
      } catch (mongoError) {
        console.error("❌ MongoDB update failed:", mongoError);
      }
      
      toast({
        title: "Admin Status Updated",
        description: `User admin status has been ${isAdmin ? 'granted' : 'revoked'}`
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
      
      if (onPermissionError) {
        onPermissionError(error);
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSubscriptionAssigned = async (userId: string, packageId: string) => {
    try {
      setUpdatingUserId(userId);
      await loadUsers(); 
      
      toast({
        title: "Subscription Assigned",
        description: `Successfully assigned subscription package to user.`
      });
      
      try {
        await axios.post('http://localhost:3001/api/users', {
          id: userId,
          subscriptionPackage: packageId,
          subscriptionAssignedAt: new Date(),
          lastUpdated: new Date()
        });
      } catch (mongoError) {
        console.error("❌ Failed to assign subscription in MongoDB:", mongoError);
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">User Permissions Management</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadUsers}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Refresh Users"}
          </Button>
          {users.length === 0 && !isLoading && (
            <Button 
              onClick={createTestUsersIfEmpty}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              Create Test Users
            </Button>
          )}
        </div>
      </div>
      
      {mongoConnected === false && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
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
          <AlertCircle className="h-4 w-4" />
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

      <div className="rounded-md border shadow">
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
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {!isLoading && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id || user.uid}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || user.displayName || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || "User"}
                      onValueChange={(value) => handleRoleChange(user.id || user.uid, value)}
                      disabled={isLoading || updatingUserId === (user.id || user.uid)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Influencer">Influencer</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isAdmin}
                        onCheckedChange={(checked) => handleAdminToggle(user.id || user.uid, checked)}
                        disabled={isLoading || updatingUserId === (user.id || user.uid)}
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
                      onAssigned={(packageId) => handleSubscriptionAssigned(user.id || user.uid, packageId)} 
                      disabled={isLoading || updatingUserId === (user.id || user.uid)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {loadingError ? "Error loading users" : "No users found"}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
