
import React, { useState, useEffect } from 'react';
import { User, UserSubscription, SubscriptionStatus } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BringToFront, UserCheck, UserX, Unlink, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { dateToISOString } from '@/utils/date-utils';

interface UserSubscriptionMappingProps {
  users: User[];
  onMappingComplete?: () => void;
}

const UserSubscriptionMapping: React.FC<UserSubscriptionMappingProps> = ({ 
  users,
  onMappingComplete
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<Record<string, UserSubscription>>({});
  const [packages, setPackages] = useState<Array<{ id: string, name: string, price: number }>>([]);
  
  // Initialize with mock data
  useEffect(() => {
    // Mock packages
    setPackages([
      { id: 'basic', name: 'Basic Plan', price: 999 },
      { id: 'standard', name: 'Standard Plan', price: 1999 },
      { id: 'premium', name: 'Premium Plan', price: 2999 },
      { id: 'enterprise', name: 'Enterprise Plan', price: 4999 }
    ]);
    
    // Mock existing subscriptions for some users
    const mockSubscriptions: Record<string, UserSubscription> = {};
    
    // Assign random subscriptions to some users
    users.forEach((user, index) => {
      if (index % 3 === 0) { // Assign to every 3rd user
        const packageId = packages[index % packages.length]?.id || 'basic';
        const packageName = packages.find(p => p.id === packageId)?.name || 'Basic Plan';
        
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(now.getMonth() + 6); // 6 month subscription
        
        mockSubscriptions[user.id] = {
          id: `sub_${Date.now() + index}`,
          userId: user.id,
          packageId,
          packageName,
          status: 'active',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          amount: packages.find(p => p.id === packageId)?.price || 0,
          paymentType: 'recurring'
        };
      }
    });
    
    setUserSubscriptions(mockSubscriptions);
  }, [users]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };
  
  const handleAssignSubscription = async () => {
    if (!selectedUserId || !selectedPackageId) {
      toast({
        title: "Missing Information",
        description: "Please select both a user and a package",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Find selected package
      const selectedPackage = packages.find(p => p.id === selectedPackageId);
      
      if (!selectedPackage) {
        throw new Error("Selected package not found");
      }
      
      // Create start/end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
      
      // Create subscription
      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        userId: selectedUserId,
        packageId: selectedPackageId,
        packageName: selectedPackage.name,
        status: 'active',
        startDate: dateToISOString(startDate),
        endDate: dateToISOString(endDate),
        amount: selectedPackage.price
      };
      
      // Update state (in a real app, this would be an API call)
      setUserSubscriptions(prev => ({
        ...prev,
        [selectedUserId]: newSubscription
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Subscription Assigned",
        description: `Successfully assigned ${selectedPackage.name} to the selected user`,
      });
      
      // Reset selection
      setSelectedUserId('');
      setSelectedPackageId('');
      
      if (onMappingComplete) {
        onMappingComplete();
      }
    } catch (error) {
      console.error("Error assigning subscription:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign subscription",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async (userId: string) => {
    setIsProcessing(true);
    
    try {
      const subscription = userSubscriptions[userId];
      
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      
      // Update the subscription
      const updatedSubscription: UserSubscription = {
        ...subscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: 'Manual cancellation'
      };
      
      // Update state (in a real app, this would be an API call)
      setUserSubscriptions(prev => ({
        ...prev,
        [userId]: updatedSubscription
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Subscription Cancelled",
        description: "Successfully cancelled the subscription",
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Subscription</CardTitle>
          <CardDescription>
            Link users with subscription packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Package</label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatPrice(pkg.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            className="w-full mt-4"
            onClick={handleAssignSubscription}
            disabled={!selectedUserId || !selectedPackageId || isProcessing}
          >
            <Link className="mr-2 h-4 w-4" />
            Assign Subscription
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>
            Current subscription assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(userSubscriptions).length > 0 ? (
            <div className="space-y-4">
              {Object.values(userSubscriptions).map(subscription => {
                const user = users.find(u => u.id === subscription.userId);
                
                if (!user) return null;
                
                return (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">
                        {user.name || user.email || user.id}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={subscription.status === 'active' ? "default" : "secondary"}
                          className={subscription.status === 'cancelled' ? "bg-gray-500" : ""}
                        >
                          {subscription.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {subscription.packageName}
                        </span>
                      </div>
                    </div>
                    
                    {subscription.status === 'active' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelSubscription(user.id)}
                        disabled={isProcessing}
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BringToFront className="h-12 w-12 mx-auto opacity-20 mb-2" />
              <p>No active subscriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSubscriptionMapping;
