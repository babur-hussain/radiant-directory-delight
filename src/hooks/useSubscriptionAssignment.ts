
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription } from '@/lib/subscription';
import { adminAssignSubscription } from '@/lib/subscription/admin-subscription';
import { User } from '@/types/auth';
import { useToast } from './use-toast';
import { getPackageById } from '@/data/subscriptionData';

export const useSubscriptionAssignment = (targetUser: User, onAssigned?: (packageId: string) => void) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  
  // Load packages and current subscription on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load packages
        const packageData = await import('@/data/subscriptionData');
        const userRole = targetUser?.role || 'User';
        
        if (userRole === 'Business') {
          setPackages(packageData.businessPackages);
        } else if (userRole === 'Influencer') {
          setPackages(packageData.influencerPackages);
        } else {
          // Default to business packages if no specific role
          setPackages([...packageData.businessPackages, ...packageData.influencerPackages]);
        }
        
        // Load current subscription if available
        if (targetUser?.subscription) {
          setUserCurrentSubscription(targetUser.subscription);
          
          // Select current package in dropdown
          if (targetUser.subscription.packageId) {
            setSelectedPackage(targetUser.subscription.packageId);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load subscription data");
      }
    };
    
    loadData();
  }, [targetUser]);
  
  // Handle assigning package to user
  const handleAssignPackage = useCallback(async () => {
    if (!selectedPackage) {
      setError("Please select a package to assign");
      return;
    }
    
    if (!currentUser?.isAdmin) {
      setError("Only admins can assign packages");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const packageDetails = getPackageById(selectedPackage, packages);
      
      if (!packageDetails) {
        throw new Error("Package not found");
      }
      
      // Determine if this is a one-time package
      const isOneTime = packageDetails.paymentType === "one-time";
      
      // Create subscription data
      const subscriptionData = {
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        amount: packageDetails.price,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        userId: targetUser.id,
        assignedBy: currentUser.id,
        assignedAt: new Date().toISOString(),
        isPausable: !isOneTime,
        isUserCancellable: !isOneTime,
        paymentType: isOneTime ? "one-time" : "recurring"
      };
      
      // Assign subscription
      const success = await adminAssignSubscription(targetUser.id, subscriptionData);
      
      if (success) {
        toast({
          title: "Subscription Assigned",
          description: `Successfully assigned ${packageDetails.title} to user.`,
        });
        
        setUserCurrentSubscription({
          ...subscriptionData,
          id: `sub_${Date.now()}`
        });
        
        if (onAssigned) {
          onAssigned(packageDetails.id);
        }
      } else {
        throw new Error("Failed to assign subscription");
      }
    } catch (error) {
      console.error("Error assigning package:", error);
      setError(error instanceof Error ? error.message : "Failed to assign package");
      
      toast({
        title: "Assignment Failed",
        description: "Could not assign subscription package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, onAssigned, packages, selectedPackage, targetUser.id, toast]);
  
  // Handle cancelling subscription
  const handleCancelSubscription = useCallback(async () => {
    if (!userCurrentSubscription) {
      setError("No active subscription to cancel");
      return;
    }
    
    if (!currentUser?.isAdmin) {
      setError("Only admins can cancel subscriptions");
      return;
    }
    
    // Check if this is a one-time subscription which can't be cancelled
    if (userCurrentSubscription.paymentType === "one-time") {
      setError("One-time purchases cannot be cancelled");
      toast({
        title: "Cannot Cancel",
        description: "One-time purchases cannot be cancelled",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update subscription to cancelled status
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: "admin_cancelled"
      };
      
      const success = await updateUserSubscription(targetUser.id, updatedSubscription);
      
      if (success) {
        toast({
          title: "Subscription Cancelled",
          description: "Successfully cancelled the subscription.",
        });
        
        setUserCurrentSubscription(updatedSubscription);
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel subscription");
      
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.isAdmin, targetUser.id, toast, userCurrentSubscription]);
  
  return {
    isLoading,
    error,
    packages,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription
  };
};
