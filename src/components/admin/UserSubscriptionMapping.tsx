
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

interface UserSubscriptionMappingProps {
  onPermissionError?: (error: any) => void;
}

const UserSubscriptionMapping: React.FC<UserSubscriptionMappingProps> = ({ onPermissionError }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  
  // Fetch all users and subscription packages
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get all users
        const allUsersData = JSON.parse(localStorage.getItem("all_users_data") || "[]");
        
        // Get all subscription packages
        const allPackages = await fetchSubscriptionPackages();
        
        setUsers(allUsersData);
        setPackages(allPackages);
        
        // Get current subscriptions
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        
        // Add subscription info to users
        const usersWithSubscriptions = allUsersData.map((user: User) => ({
          ...user,
          subscription: userSubscriptions[user.id] || null
        }));
        
        setUsers(usersWithSubscriptions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load users or subscription packages.");
        
        if (onPermissionError) {
          onPermissionError(error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [onPermissionError]);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle assigning package to user
  const handleAssignPackage = (userId: string, packageId: string) => {
    try {
      if (!currentUser?.isAdmin) {
        setError("You don't have permission to assign packages.");
        return;
      }
      
      // Find the package
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        toast({
          title: "Error",
          description: "Invalid package selected.",
          variant: "destructive"
        });
        return;
      }
      
      // Create subscription data
      const subscriptionData = {
        id: `sub_${Date.now()}`,
        userId: userId,
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        amount: selectedPackage.price,
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedPackage.durationMonths * 30 * 24 * 60 * 60 * 1000),
        status: "active",
      };
      
      // Update localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[userId] = subscriptionData;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Update state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            subscription: subscriptionData
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "Subscription has been assigned successfully."
      });
    } catch (error) {
      console.error("Error assigning package:", error);
      toast({
        title: "Error",
        description: "Failed to assign subscription package.",
        variant: "destructive"
      });
    }
  };
  
  // Handle removing a subscription
  const handleRemoveSubscription = (userId: string) => {
    try {
      if (!currentUser?.isAdmin) {
        setError("You don't have permission to remove subscriptions.");
        return;
      }
      
      // Update localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      
      if (userSubscriptions[userId]) {
        userSubscriptions[userId].status = "cancelled";
        localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
        
        // Update state
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            if (user.subscription) {
              return {
                ...user,
                subscription: {
                  ...user.subscription,
                  status: "cancelled"
                }
              };
            }
          }
          return user;
        });
        
        setUsers(updatedUsers);
        
        toast({
          title: "Success",
          description: "Subscription has been cancelled successfully."
        });
      }
    } catch (error) {
      console.error("Error removing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // If there's an error or still loading
  if (error && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Subscription Mapping</CardTitle>
          <CardDescription>
            Assign subscription packages to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground mt-2">Please check your permissions or try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Subscription Mapping</CardTitle>
        <CardDescription>
          Manage and assign subscription packages to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        <div className="mb-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email"
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        {/* User Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Current Subscription</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role || "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <p>{user.subscription.packageName}</p>
                      ) : (
                        <p className="text-muted-foreground">No subscription</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription?.endDate ? (
                        formatDate(user.subscription.endDate)
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <Badge variant={user.subscription.status === 'active' ? 'default' : 'destructive'}>
                          {user.subscription.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {user.subscription.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No subscription</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select
                          onValueChange={(value) => handleAssignPackage(user.id, value)}
                          disabled={!currentUser?.isAdmin}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Assign package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages.map(pkg => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {user.subscription?.status === 'active' && (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSubscription(user.id)}
                            disabled={!currentUser?.isAdmin}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionMapping;
