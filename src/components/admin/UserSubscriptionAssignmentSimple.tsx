
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { User, UserSubscription } from '@/types/auth';
import { isAdmin, isBusiness, isInfluencer } from '@/utils/roleUtils';
import { dateToISOString } from '@/utils/date-utils';

interface UserSubscriptionAssignmentSimpleProps {
  user: User;
  onAssignComplete?: (success: boolean) => void;
}

const UserSubscriptionAssignmentSimple: React.FC<UserSubscriptionAssignmentSimpleProps> = ({ 
  user, 
  onAssignComplete 
}) => {
  const [packageId, setPackageId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [packages, setPackages] = useState<Array<{ id: string, name: string }>>([]);
  
  useEffect(() => {
    // Simple package filter based on user role
    const availablePackages = [];
    
    // Filter packages by role
    if (isBusiness(user.role)) {
      availablePackages.push(
        { id: 'basic-business', name: 'Basic Business' },
        { id: 'premium-business', name: 'Premium Business' },
        { id: 'enterprise-business', name: 'Enterprise Business' }
      );
    } else if (isInfluencer(user.role)) {
      availablePackages.push(
        { id: 'basic-influencer', name: 'Basic Influencer' },
        { id: 'premium-influencer', name: 'Premium Influencer' }
      );
    } else if (isAdmin(user.role)) {
      availablePackages.push(
        { id: 'admin-package', name: 'Admin Package' }
      );
    } else {
      // Default packages for any user
      availablePackages.push(
        { id: 'basic-user', name: 'Basic User' },
        { id: 'premium-user', name: 'Premium User' }
      );
    }
    
    setPackages(availablePackages);
  }, [user.role]);
  
  const handleAssignPackage = async () => {
    if (!packageId) {
      toast({
        title: "Error",
        description: "Please select a package to assign",
        variant: "destructive"
      });
      return;
    }
    
    setIsAssigning(true);
    
    try {
      // Get the selected package details
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      
      if (!selectedPackage) {
        throw new Error("Selected package not found");
      }
      
      // Create start/end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
      
      // Create subscription object
      const subscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        userId: user.id,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        status: 'active',
        startDate: dateToISOString(startDate),
        endDate: dateToISOString(endDate),
        amount: 0,
        paymentType: 'one-time'
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success!
      toast({
        title: "Package Assigned",
        description: `Successfully assigned ${selectedPackage.name} to ${user.name || user.email}`,
      });
      
      if (onAssignComplete) {
        onAssignComplete(true);
      }
    } catch (error) {
      console.error("Error assigning package:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign package to user",
        variant: "destructive"
      });
      
      if (onAssignComplete) {
        onAssignComplete(false);
      }
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Select Package</label>
        <Select 
          value={packageId} 
          onValueChange={setPackageId}
          disabled={isAssigning}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a package" />
          </SelectTrigger>
          <SelectContent>
            {packages.map(pkg => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        onClick={handleAssignPackage}
        disabled={!packageId || isAssigning}
        className="w-full"
      >
        {isAssigning ? "Assigning..." : "Assign Package"}
      </Button>
    </div>
  );
};

export default UserSubscriptionAssignmentSimple;
