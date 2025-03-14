
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, UserCheck, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPackageById } from "@/data/subscriptionData";
import { toast } from "@/hooks/use-toast";

// For demo purposes, we'll use this mock data
const mockSubscriptions = [
  {
    id: "sub_123456",
    userId: "user1",
    userName: "John Doe",
    userEmail: "john@example.com",
    packageId: "business-standard",
    startDate: new Date(2023, 5, 15),
    endDate: new Date(2024, 5, 15),
    status: "active",
    amount: 1999
  },
  {
    id: "sub_234567",
    userId: "user2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    packageId: "influencer-growth",
    startDate: new Date(2023, 7, 22),
    endDate: new Date(2024, 7, 22),
    status: "active",
    amount: 1599
  },
  {
    id: "sub_345678",
    userId: "user3",
    userName: "Robert Johnson",
    userEmail: "robert@example.com",
    packageId: "business-premium",
    startDate: new Date(2023, 4, 10),
    endDate: new Date(2024, 4, 10),
    status: "cancelled",
    amount: 3999
  },
  {
    id: "sub_456789",
    userId: "user4",
    userName: "Emily Brown",
    userEmail: "emily@example.com",
    packageId: "influencer-pro",
    startDate: new Date(2023, 9, 5),
    endDate: new Date(2024, 9, 5),
    status: "active",
    amount: 2999
  }
];

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Simulate verifying a subscription
  const handleVerifySubscription = (subscriptionId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update subscription status
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: "active" } : sub
      );
      
      setSubscriptions(updatedSubscriptions);
      setIsLoading(false);
      
      toast({
        title: "Subscription Verified",
        description: `Subscription ${subscriptionId} has been verified successfully.`
      });
    }, 1000);
  };
  
  // Simulate cancelling a subscription
  const handleCancelSubscription = (subscriptionId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update subscription status
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: "cancelled" } : sub
      );
      
      setSubscriptions(updatedSubscriptions);
      setIsLoading(false);
      
      toast({
        title: "Subscription Cancelled",
        description: `Subscription ${subscriptionId} has been cancelled successfully.`
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>Manage active subscriptions and perform admin actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or subscription ID"
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm("")} disabled={!searchTerm}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => {
                  const packageDetails = getPackageById(subscription.packageId);
                  
                  return (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.userName}</p>
                          <p className="text-sm text-muted-foreground">{subscription.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{packageDetails?.title || subscription.packageId}</TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.endDate)}</TableCell>
                      <TableCell>₹{subscription.amount}</TableCell>
                      <TableCell>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                          {subscription.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {subscription.status === 'active' ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleVerifySubscription(subscription.id)}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No subscriptions found
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
