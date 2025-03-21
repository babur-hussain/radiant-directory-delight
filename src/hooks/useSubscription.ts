
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { ISubscription, PaymentType, BillingCycle } from '@/models/Subscription';
import { ISubscriptionPackage } from './useSubscriptionPackages';
import { 
  createSubscription, 
  getActiveUserSubscription, 
  getUserSubscriptions, 
  updateSubscription, 
  cancelSubscription
} from '@/services/subscriptionService';

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchUserSubscription = async () => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const userSubscription = await getActiveUserSubscription(userId);
      setSubscription(userSubscription);
      setError(null);
    } catch (e) {
      console.error('Error fetching subscription:', e);
      setError(e instanceof Error ? e : new Error('Failed to fetch subscription'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserSubscription();
  }, [userId]);
  
  const purchaseSubscription = async (packageData: ISubscriptionPackage): Promise<ISubscription | null> => {
    if (!userId) return null;
    
    try {
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
        status: 'active',
        paymentType: packageData.paymentType as PaymentType || 'recurring',
        billingCycle: packageData.billingCycle as BillingCycle,
        signupFee: packageData.setupFee || 0,
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
    }
  };
  
  const renewSubscription = async (months: number = 12): Promise<ISubscription | null> => {
    if (!subscription || !userId) return null;
    
    try {
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
    }
  };
  
  const cancelUserSubscription = async (reason?: string): Promise<boolean> => {
    if (!subscription) return false;
    
    try {
      const now = new Date().toISOString();
      const updatedData: Partial<ISubscription> = {
        status: 'cancelled',
        cancelledAt: now,
        cancelReason: reason || 'User cancelled',
        updatedAt: now
      };
      
      const updatedSubscription = await cancelSubscription(subscription.id, reason);
      
      if (updatedSubscription) {
        setSubscription(updatedSubscription);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error cancelling subscription:', e);
      setError(e instanceof Error ? e : new Error('Failed to cancel subscription'));
      return false;
    }
  };
  
  return {
    subscription,
    loading,
    error,
    fetchUserSubscription,
    purchaseSubscription,
    renewSubscription,
    cancelSubscription: cancelUserSubscription
  };
};
