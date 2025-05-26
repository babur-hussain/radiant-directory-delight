
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { adminAssignPaytmSubscription } from '@/lib/subscription/admin-paytm-subscription';

export const useAdminPaytmSubscription = (userId: string) => {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a Paytm subscription for a user
  const createPaytmSubscription = useCallback(async (packageData: any, paymentDetails: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!adminUser?.isAdmin) {
        throw new Error("Only administrators can assign Paytm subscriptions");
      }
      
      const success = await adminAssignPaytmSubscription(userId, packageData, paymentDetails);
      
      if (success) {
        toast({
          title: "Subscription Created",
          description: `Successfully created Paytm subscription for user.`,
        });
        return true;
      } else {
        throw new Error("Failed to create Paytm subscription");
      }
    } catch (error) {
      console.error("Error creating Paytm subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to create subscription");
      
      toast({
        title: "Creation Failed",
        description: "Could not create Paytm subscription",
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
    createPaytmSubscription,
    adminPauseSubscription,
    adminResumeSubscription,
    isLoading,
    error
  };
};
