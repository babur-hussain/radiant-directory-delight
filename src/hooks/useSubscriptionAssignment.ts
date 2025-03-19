import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription } from '@/lib/subscription';
import { adminAssignSubscription } from '@/lib/subscription/admin-subscription';
import { User, UserSubscription } from '@/types/auth';
import { useToast } from './use-toast';
import { getPackageById, convertToSubscriptionPackage } from '@/data/subscriptionData';
import { fetchSubscriptionPackages, fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';
import { ISubscription } from '@/models/Subscription';

export const useSubscriptionAssignment = (targetUser: User, onAssigned?: (packageId: string) => void) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        let fetchedPackages = [];
        const userRole = targetUser?.role || 'User';
        
        if (userRole === 'Business' || userRole === 'Influencer') {
          fetchedPackages = await fetchSubscriptionPackagesByType(userRole);
        } else {
          fetchedPackages = await fetchSubscriptionPackages();
        }
        
        const convertedPackages = fetchedPackages.map(pkg => convertToSubscriptionPackage(pkg));
        setPackages(convertedPackages);
        
        if (targetUser?.subscription && typeof targetUser.subscription !== 'string') {
          setUserCurrentSubscription(targetUser.subscription as UserSubscription);
          
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
      
      const isOneTime = packageDetails.paymentType === "one-time";
      
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
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const success = await adminAssignSubscription(targetUser.id || targetUser.uid, subscriptionData);
      
      if (success) {
        toast({
          title: "Subscription Assigned",
          description: `Successfully assigned ${packageDetails.title} to user.`,
        });
        
        setUserCurrentSubscription({
          ...subscriptionData,
          id: `sub_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, onAssigned, packages, selectedPackage, targetUser, toast]);
  
  const handleCancelSubscription = useCallback(async () => {
    if (!userCurrentSubscription) {
      setError("No active subscription to cancel");
      return;
    }
    
    if (!currentUser?.isAdmin) {
      setError("Only admins can cancel subscriptions");
      return;
    }
    
    if (userCurrentSubscription.paymentType === "one-time") {
      setError("One-time purchases cannot be cancelled");
      toast({
        title: "Cannot Cancel",
        description: "One-time purchases cannot be cancelled",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const subscriptionForDB: ISubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: "admin_cancelled",
        startDate: typeof userCurrentSubscription.startDate === 'object'
          ? userCurrentSubscription.startDate.toISOString()
          : userCurrentSubscription.startDate,
        endDate: typeof userCurrentSubscription.endDate === 'object'
          ? userCurrentSubscription.endDate.toISOString()
          : userCurrentSubscription.endDate,
        createdAt: new Date(),
        updatedAt: new Date()
      } as ISubscription;
      
      const success = await updateUserSubscription(targetUser.id || targetUser.uid, subscriptionForDB);
      
      if (success) {
        toast({
          title: "Subscription Cancelled",
          description: "Successfully cancelled the subscription.",
        });
        
        setUserCurrentSubscription({
          ...userCurrentSubscription,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelReason: "admin_cancelled",
          updatedAt: new Date().toISOString()
        } as UserSubscription);
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel subscription");
      
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the subscription",
        variant: "destructive"
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
