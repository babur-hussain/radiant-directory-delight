import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import UserSubscriptionAssignment from "./UserSubscriptionAssignment";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface UserPermissionsTabProps {
  onRefresh?: () => void;
}

const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ onRefresh }) => {
  const { user: currentUser, updateUserRole, updateUserPermission } = useAuth();
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  
  const users = JSON.parse(localStorage.getItem('all_users_data') || '[]');
  
  const handleRoleChange = async (user: User, role: UserRole) => {
    try {
      await updateUserRole(user, role);
      toast({
        title: "Success",
        description: `Updated role for ${user.email} to ${role}`,
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  const handleAdminToggle = async (user: User, isAdmin: boolean) => {
    try {
      await updateUserPermission(user.id, isAdmin);
      toast({
        title: "Success",
        description: `${isAdmin ? "Granted" : "Revoked"} admin permission for ${user.email}`,
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating admin permission:", error);
      toast({
        title: "Error",
        description: "Failed to update admin permission",
        variant: "destructive",
      });
    }
  };
  
  const toggleExpand = (userId: string) => {
    setExpanded(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  const getUserName = (user: User) => {
    let userName = null;
    
    if (user.name === null) {
      userName = null;
    } else if (typeof user.name === 'string') {
      userName = user.name;
    } else if (typeof user.name === 'boolean') {
      userName = 'User';
    } else if (user.name) {
      try {
        userName = String(user.name);
      } catch {
        userName = null;
      }
    } else {
      userName = null;
    }
    
    let adminStatus = false;
    if (typeof user.isAdmin === 'boolean') {
      adminStatus = user.isAdmin;
    } else if (typeof user.isAdmin === 'string') {
      adminStatus = user.isAdmin === 'true';
    } else {
      adminStatus = !!user.isAdmin;
    }
    
    return {
      displayName: userName || user.email || "Unknown User",
      isAdmin: adminStatus
    };
  };

  const getUserSubscription = (userId: string) => {
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    return userSubscriptions[userId] || null;
  };
  
  const handleSubscriptionAssigned = () => {
    // Force re-render by updating state
    setExpanded(prev => ({...prev}));
    // Call the onRefresh callback if provided
    if (onRefresh) onRefresh();
  };
  
  if (!currentUser?.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>You don't have permission to manage user permissions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users & Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>Manage user roles and admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user: User) => {
                const { displayName, isAdmin } = getUserName(user);
                const subscription = getUserSubscription(user.id);
                
                return (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {subscription && (
                          <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'} className="mt-1">
                            {subscription.status === 'active' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {subscription.packageName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          className="text-sm text-blue-500 hover:underline"
                          onClick={() => toggleExpand(user.id)}
                        >
                          {expanded[user.id] ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                    </div>
                    
                    {expanded[user.id] && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Label htmlFor={`role-${user.id}`}>User Role</Label>
                            <Select
                              defaultValue={user.role || "User"}
                              onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                            >
                              <SelectTrigger id={`role-${user.id}`}>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Influencer">Influencer</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="User">Regular User</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`admin-${user.id}`} className="block mb-2">Admin Access</Label>
                            <Switch
                              id={`admin-${user.id}`}
                              checked={isAdmin}
                              onCheckedChange={(checked) => handleAdminToggle(user, checked)}
                            />
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <Label className="block mb-2">Subscription Assignment</Label>
                          <UserSubscriptionAssignment 
                            user={user} 
                            onAssigned={handleSubscriptionAssigned}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default UserPermissionsTab;
