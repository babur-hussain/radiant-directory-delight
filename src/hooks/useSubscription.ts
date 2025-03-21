
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { ISubscription, PaymentType, BillingCycle, SubscriptionStatus } from '@/models/Subscription';
import { ISubscriptionPackage } from '@/models/Subscription';
import { 
  createSubscription, 
  getActiveUserSubscription, 
  getUserSubscriptions, 
  updateSubscription, 
  cancelSubscription 
} from '@/services/subscriptionService';

export interface SubscriptionResponse {
  success: boolean;
  data?: ISubscription | null;
  error?: string;
}

export const useSubscription = (userId?: string | null) => {
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fetchUserSubscription = async (id?: string): Promise<SubscriptionResponse> => {
    const userIdToUse = id || userId;
    if (!userIdToUse) {
      setSubscription(null);
      setLoading(false);
      return { success: false, error: "No user ID provided" };
    }
    
    try {
      setLoading(true);
      const userSubscription = await getActiveUserSubscription(userIdToUse);
      setSubscription(userSubscription);
      setError(null);
      return { success: true, data: userSubscription };
    } catch (e) {
      console.error('Error fetching subscription:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch subscription';
      setError(e instanceof Error ? e : new Error(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchUserSubscription(userId);
    }
  }, [userId]);
  
  const purchaseSubscription = async (packageData: ISubscriptionPackage): Promise<ISubscription | null> => {
    if (!userId) return null;
    
    try {
      setIsProcessing(true);
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + (packageData.durationMonths || 12));
      
      const subscriptionData: Partial<ISubscription> = {
        id: nanoid(),
        userId: userId,
        packageId: packageData.id,
        packageName: packageData.title,
        amount: packageData.price,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active' as SubscriptionStatus,
        paymentType: packageData.paymentType as PaymentType || 'recurring',
        billingCycle: packageData.billingCycle as BillingCycle,
        signupFee: packageData.setupFee || 0,
        advancePaymentMonths: packageData.advancePaymentMonths || 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      
      const newSubscription = await createSubscription(subscriptionData);
      setSubscription(newSubscription);
      return newSubscription;
    } catch (e) {
      console.error('Error purchasing subscription:', e);
      setError(e instanceof Error ? e : new Error('Failed to purchase subscription'));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const initiateSubscription = async (packageId: string, paymentData?: any): Promise<SubscriptionResponse> => {
    try {
      setIsProcessing(true);
      // Implementation would typically involve creating a pending subscription
      // and processing payment information
      console.log('Initiating subscription for package:', packageId, 'with payment data:', paymentData);
      
      // Fake successful subscription for now
      return { 
        success: true, 
        data: {
          id: nanoid(),
          userId: userId || '',
          packageId,
          packageName: 'Subscription Package',
          status: 'active' as SubscriptionStatus,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 0,
          paymentType: 'recurring'
        }
      };
    } catch (e) {
      console.error('Error initiating subscription:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to initiate subscription';
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renewSubscription = async (months: number = 12): Promise<ISubscription | null> => {
    if (!subscription || !userId) return null;
    
    try {
      setIsProcessing(true);
      const now = new Date();
      // If subscription has expired, set new start date as now
      const startDate = new Date(subscription.endDate) < now 
        ? now 
        : new Date(subscription.endDate);
      
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + months);
      
      const updatedSubscription = await updateSubscription(subscription.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        updatedAt: now.toISOString()
      });
      
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (e) {
      console.error('Error renewing subscription:', e);
      setError(e instanceof Error ? e : new Error('Failed to renew subscription'));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const cancelUserSubscription = async (reason?: string): Promise<boolean> => {
    if (!subscription) return false;
    
    try {
      setIsProcessing(true);
      const now = new Date().toISOString();
      const updatedData: Partial<ISubscription> = {
        status: 'cancelled',
        cancelledAt: now,
        cancelReason: reason || 'User cancelled',
        updatedAt: now
      };
      
      // Fix: boolean return value expected, not subscription object
      const success = await cancelSubscription(subscription.id, reason);
      
      if (success) {
        // Instead of setting subscription directly to the boolean result,
        // update it with canceled status
        setSubscription(prev => prev ? {...prev, ...updatedData} : null);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error cancelling subscription:', e);
      setError(e instanceof Error ? e : new Error('Failed to cancel subscription'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getUserDashboardFeatures = async (userId?: string): Promise<string[]> => {
    try {
      const userIdToUse = userId || userId;
      if (!userIdToUse) return [];
      
      // Get the active subscription
      const userSubscription = await getActiveUserSubscription(userIdToUse);
      
      if (!userSubscription) return [];
      
      // Return dashboard features from the subscription
      return userSubscription.dashboardFeatures || [];
    } catch (error) {
      console.error('Error fetching dashboard features:', error);
      return [];
    }
  };
  
  return {
    subscription,
    loading,
    error,
    isProcessing,
    fetchUserSubscription,
    purchaseSubscription,
    initiateSubscription,
    renewSubscription,
    cancelSubscription: cancelUserSubscription,
    getUserDashboardFeatures
  };
};

export default useSubscription;
