
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, IUser } from "@/models/User";
import { connectToMongoDB } from "@/config/mongodb";
import { extractQueryData } from "@/utils/queryHelpers";
import DashboardSectionsManager from "./DashboardSectionsManager";

const UserDashboardCustomizer: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find(u => u.uid === selectedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await connectToMongoDB();
      
      // Get the query object for users
      const userQuery = User.find();
      
      // Extract user data safely using our utility function
      const userResults = extractQueryData<IUser>(userQuery);
      
      setUsers(userResults);
      
      if (userResults.length > 0 && !selectedUserId) {
        setSelectedUserId(userResults[0].uid);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Dashboard Customization</CardTitle>
          <CardDescription>
            Select a user to customize their dashboard elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedUserId} 
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.uid} value={user.uid}>
                  {user.name || user.email || user.uid} 
                  {user.role && ` (${user.role})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedUser && (
        <DashboardSectionsManager 
          userId={selectedUser.uid} 
          isAdmin={true} 
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default UserDashboardCustomizer;
