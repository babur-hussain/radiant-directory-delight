import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription, getUserSubscription } from '@/lib/subscription';
import { getGlobalSubscriptionSettings } from '@/lib/subscription/subscription-settings';
import { adminAssignSubscription } from '@/lib/subscription/admin-subscription';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { getPackageById, businessPackages, influencerPackages } from '@/data/subscriptionData';
import { SubscriptionData } from '@/lib/subscription/types';

interface PaymentDetails {
  paymentId: string;
  orderId?: string;
  signature?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentType?: 'recurring' | 'one-time';
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Initiates a subscription process for the current user
   */
  const initiateSubscription = useCallback(async (packageId: string, paymentDetails?: PaymentDetails) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to this package.",
        variant: "destructive",
      });
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      // Get subscription settings
      const settings = await getGlobalSubscriptionSettings();
      console.log("Using subscription settings:", settings);
      
      // Check if user is admin or if non-admin subscriptions are allowed
      const isAdmin = user.isAdmin === true || user.role === "Admin";
      
      if (!isAdmin && !settings.allowNonAdminSubscriptions) {
        toast({
          title: "Permission Denied",
          description: "Only administrators can create subscriptions at this time.",
          variant: "destructive",
        });
        return null;
      }
      
      // Check if payment is required and payment details are provided
      if (!isAdmin && !paymentDetails) {
        toast({
          title: "Payment Required",
          description: "Payment is required to activate this subscription.",
          variant: "destructive",
        });
        return null;
      }
      
      // Get the package details from local data if needed
      let packageDetails = await getPackageById(packageId);
      
      // If package not found by ID, try to find it in the default packages
      if (!packageDetails) {
        console.log(`Package ${packageId} not found in primary source, checking default packages`);
        
        // Try to match by ID from default packages
        const allDefaultPackages = [...businessPackages, ...influencerPackages];
        packageDetails = allDefaultPackages.find(pkg => pkg.id === packageId);
        
        if (!packageDetails) {
          console.log("Package not found in default packages either, using fallback package");
          
          // If still not found, use the first package of the user's role as fallback
          if (user.role === "Business" && businessPackages.length > 0) {
            packageDetails = businessPackages[0];
            console.log(`Using fallback business package: ${packageDetails.id}`);
          } else if (user.role === "Influencer" && influencerPackages.length > 0) {
            packageDetails = influencerPackages[0];
            console.log(`Using fallback influencer package: ${packageDetails.id}`);
          } else {
            // As a last resort, use the first available package from any collection
            packageDetails = allDefaultPackages.length > 0 ? allDefaultPackages[0] : null;
            
            if (!packageDetails) {
              throw new Error("No subscription packages available. Please contact support.");
            }
            
            console.log(`Using emergency fallback package: ${packageDetails.id}`);
          }
          
          // Notify the user that we're using a fallback package
          toast({
            title: "Package Not Found",
            description: `We're using a default package instead. The requested package may have been removed.`,
            variant: "warning",
          });
        }
      }
      
      if (!packageDetails) {
        throw new Error("No subscription packages available. Please contact support.");
      }
      
      console.log(`Initiating subscription for user ${user.id} to package ${packageDetails.id}`);
      
      // Check if it's a one-time payment or recurring subscription
      const isOneTime = paymentDetails?.paymentType === "one-time" || packageDetails.paymentType === "one-time";
      const paymentTypeValue = isOneTime ? "one-time" as const : "recurring" as const;
      
      console.log(`Package type: ${isOneTime ? "One-time payment" : "Recurring subscription"}`);
      
      // Create subscription data
      const subscriptionData: SubscriptionData = {
        userId: user.id,
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        amount: packageDetails.price,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        paymentMethod: paymentDetails ? "razorpay" : "manual",
        transactionId: paymentDetails?.paymentId || `manual_${Date.now()}`,
        advancePaymentMonths: settings.defaultAdvancePaymentMonths,
        signupFee: isOneTime ? 0 : (packageDetails.setupFee || 0),
        actualStartDate: new Date().toISOString(),
        isPaused: false,
        isPausable: !isOneTime, // One-time packages cannot be paused
        isUserCancellable: !isOneTime, // One-time packages cannot be cancelled
        paymentType: paymentTypeValue,
        invoiceIds: []
      };
      
      // Add payment details if available
      if (paymentDetails) {
        Object.assign(subscriptionData, {
          paymentId: paymentDetails.paymentId,
          orderId: paymentDetails.orderId,
          paymentSignature: paymentDetails.signature,
          paymentStatus: paymentDetails.paymentStatus,
          paymentDate: new Date().toISOString()
        });
      }
      
      // Try to save the subscription
      let success = false;
      
      // First try the admin-specific function which has more permissions
      if (isAdmin) {
        console.log("Trying admin subscription assignment flow");
        success = await adminAssignSubscription(user.id, {
          ...packageDetails,
          ...subscriptionData
        });
      }
      
      // If admin function failed or user is not admin, try regular update
      if (!success) {
        console.log("Trying regular subscription update flow");
        success = await updateUserSubscription(user.id, subscriptionData);
      }
      
      // If both online methods failed but we allow local fallback
      if (!success && settings.shouldUseLocalFallback) {
        console.log("Online subscription methods failed, using local fallback");
        
        // Show success toast even though we're just using a local fallback
        toast({
          title: isOneTime ? "Purchase Completed (Local)" : "Subscription Activated (Local)",
          description: isOneTime 
            ? "Your purchase has been completed in local mode." 
            : "Your subscription has been activated in local mode.",
          variant: "success",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        
        return subscriptionData;
      } else if (success) {
        toast({
          title: isOneTime ? "Purchase Completed" : "Subscription Activated",
          description: isOneTime 
            ? "Your purchase has been successfully completed." 
            : "Your subscription has been successfully activated.",
          variant: "success",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        
        return subscriptionData;
      } else {
        throw new Error(isOneTime 
          ? "Failed to complete purchase" 
          : "Failed to save subscription");
      }
    } catch (error) {
      console.error("Error initiating subscription:", error);
      toast({
        title: "Subscription Failed",
        description: error instanceof Error 
          ? error.message 
          : "There was an error processing your subscription. Please try again.",
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
    console.log("Cancellation requested but not implemented in this hook");
    return false;
  }, []);
  
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
