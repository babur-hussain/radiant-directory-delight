
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isAdmin: boolean;
}

const UserPermissionsTab = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateUserPermission } = useAuth();
  const { toast } = useToast();

  // Load users from localStorage
  useEffect(() => {
    const loadUsers = () => {
      try {
        const allUsersJson = localStorage.getItem('all_users_data');
        if (allUsersJson) {
          const parsedUsers = JSON.parse(allUsersJson);
          setUsers(parsedUsers);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserPermission(userId, isAdmin);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isAdmin } : user
        )
      );
      
      toast({
        title: "Success",
        description: `Admin permission ${isAdmin ? 'granted' : 'removed'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Permissions</CardTitle>
        <CardDescription>
          Manage admin access for users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {user.role}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-green-500">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionsTab;
