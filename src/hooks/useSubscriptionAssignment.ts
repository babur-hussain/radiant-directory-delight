
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription } from '@/lib/subscription';
import { adminAssignSubscription } from '@/lib/subscription/admin-subscription';
import { User, UserSubscription } from '@/types/auth';
import { useToast } from './use-toast';
import { getPackageById, convertToSubscriptionPackage } from '@/data/subscriptionData';
import { fetchSubscriptionPackages, fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';

export const useSubscriptionAssignment = (targetUser: User, onAssigned?: (packageId: string) => void) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  
  // Load packages and current subscription on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load packages from MongoDB based on user role
        let fetchedPackages = [];
        const userRole = targetUser?.role || 'User';
        
        if (userRole === 'Business' || userRole === 'Influencer') {
          fetchedPackages = await fetchSubscriptionPackagesByType(userRole);
        } else {
          // Default to all packages if no specific role
          fetchedPackages = await fetchSubscriptionPackages();
        }
        
        // Convert to SubscriptionPackage type
        const convertedPackages = fetchedPackages.map(pkg => convertToSubscriptionPackage(pkg));
        setPackages(convertedPackages);
        
        // Load current subscription if available
        if (targetUser?.subscription && typeof targetUser.subscription !== 'string') {
          setUserCurrentSubscription(targetUser.subscription as UserSubscription);
          
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
        userId: targetUser.id || targetUser.uid,
        assignedBy: currentUser.id || currentUser.uid,
        assignedAt: new Date().toISOString(),
        isPausable: !isOneTime,
        isUserCancellable: !isOneTime,
        paymentType: isOneTime ? "one-time" : "recurring",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Assign subscription
      const success = await adminAssignSubscription(targetUser.id || targetUser.uid, subscriptionData);
      
      if (success) {
        toast({
          title: "Subscription Assigned",
          description: `Successfully assigned ${packageDetails.title} to user.`,
        });
        
        setUserCurrentSubscription({
          ...subscriptionData,
          id: `sub_${Date.now()}`
        } as UserSubscription);
        
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
  }, [currentUser, onAssigned, packages, selectedPackage, targetUser, toast]);
  
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
        cancelReason: "admin_cancelled",
        createdAt: userCurrentSubscription.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const success = await updateUserSubscription(targetUser.id || targetUser.uid, updatedSubscription);
      
      if (success) {
        toast({
          title: "Subscription Cancelled",
          description: "Successfully cancelled the subscription.",
        });
        
        setUserCurrentSubscription(updatedSubscription as UserSubscription);
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
  }, [currentUser?.isAdmin, targetUser, toast, userCurrentSubscription]);
  
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
