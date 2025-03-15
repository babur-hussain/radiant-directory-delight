
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription, getUserSubscription } from '@/lib/subscription';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Initiates a subscription process for the current user
   */
  const initiateSubscription = useCallback(async (packageId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to this package.",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if user is admin - only admins should be able to create subscriptions
    if (!user.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can create or modify subscriptions.",
        variant: "destructive",
      });
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate a successful subscription
      
      console.log(`Initiating subscription for user ${user.id} to package ${packageId}`);
      
      // Create subscription data with default values for the new required fields
      const subscriptionData = {
        userId: user.id,
        packageId: packageId,
        packageName: `Package ${packageId}`,
        amount: 999, // This would normally come from the package details
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        status: "active",
        paymentMethod: "manual",
        transactionId: `manual_${Date.now()}`,
        advancePaymentMonths: 6, // Default to 6 months advance payment
        signupFee: 0,
        actualStartDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Start after 6 months
        isPaused: false,
        isPausable: true, // Admin can pause
        isUserCancellable: false, // Users cannot cancel
        invoiceIds: []
      };
      
      // Save the subscription to Firestore
      const success = await updateUserSubscription(user.id, subscriptionData);
      
      if (success) {
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been successfully activated.",
          variant: "success",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        
        return subscriptionData;
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Error initiating subscription:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, toast, navigate]);
  
  /**
   * Cancels the current user's subscription - restricted to admin only
   */
  const cancelSubscription = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your subscriptions.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if user is admin - only admins should be able to cancel subscriptions
    if (!user.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can cancel subscriptions.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Get current subscription first
      const currentSubscription = await getUserSubscription(user.id);
      
      if (!currentSubscription) {
        toast({
          title: "No Active Subscription",
          description: "You don't have an active subscription to cancel.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update the subscription with cancelled status
      const updatedSubscription = {
        ...currentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: "admin_requested"
      };
      
      const success = await updateUserSubscription(user.id, updatedSubscription);
      
      if (success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been successfully cancelled.",
          variant: "success",
        });
        return true;
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, toast]);
  
  /**
   * Fetches the current user's subscription
   */
  const fetchUserSubscription = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      return await getUserSubscription(user.id);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      return null;
    }
  }, [user]);
  
  return {
    initiateSubscription,
    cancelSubscription,
    getUserSubscription: fetchUserSubscription,
    isProcessing
  };
};
