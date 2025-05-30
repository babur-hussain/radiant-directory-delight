
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { adminAssignPhonePeSubscription } from '@/lib/subscription/admin-phonepe-subscription';

export const useAdminPhonePeSubscription = (userId: string) => {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a PhonePe subscription for a user
  const createPhonePeSubscription = useCallback(async (packageData: any, paymentDetails: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!adminUser?.isAdmin) {
        throw new Error("Only administrators can assign PhonePe subscriptions");
      }
      
      const success = await adminAssignPhonePeSubscription(userId, packageData, paymentDetails);
      
      if (success) {
        toast({
          title: "Subscription Created",
          description: `Successfully created PhonePe subscription for user.`,
        });
        return true;
      } else {
        throw new Error("Failed to create PhonePe subscription");
      }
    } catch (error) {
      console.error("Error creating PhonePe subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to create subscription");
      
      toast({
        title: "Creation Failed",
        description: "Could not create PhonePe subscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, toast, userId]);
  
  // Mock functions for other operations
  const adminPauseSubscription = useCallback(async () => {
    console.log("Pause subscription requested");
    return false;
  }, []);
  
  const adminResumeSubscription = useCallback(async () => {
    console.log("Resume subscription requested");
    return false;
  }, []);
  
  return {
    createPhonePeSubscription,
    adminPauseSubscription,
    adminResumeSubscription,
    isLoading,
    error
  };
};
