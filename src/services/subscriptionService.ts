import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { Subscription, PaymentType, BillingCycle } from '@/models/Subscription';

// Convert from Supabase to app model
const fromSupabase = (data: any): Subscription => {
  return {
    id: data.id,
    userId: data.user_id,
    packageId: data.package_id,
    packageName: data.package_name,
    amount: data.amount,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    paymentMethod: data.payment_method,
    transactionId: data.transaction_id,
    cancelledAt: data.cancelled_at,
    cancelReason: data.cancel_reason,
    paymentType: data.payment_type as PaymentType || 'recurring',
    billingCycle: data.billing_cycle as BillingCycle,
    signupFee: data.signup_fee,
    recurringAmount: data.recurring_amount,
    razorpaySubscriptionId: data.razorpay_subscription_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Convert from app model to Supabase
const toSupabase = (data: Partial<Subscription>): any => {
  return {
    id: data.id,
    user_id: data.userId,
    package_id: data.packageId,
    package_name: data.packageName || '',
    amount: data.amount || 0,
    start_date: data.startDate || new Date().toISOString(),
    end_date: data.endDate || new Date().toISOString(),
    status: data.status || 'active',
    payment_method: data.paymentMethod,
    transaction_id: data.transactionId,
    cancelled_at: data.cancelledAt,
    cancel_reason: data.cancelReason,
    payment_type: data.paymentType,
    billing_cycle: data.billingCycle,
    signup_fee: data.signupFee,
    recurring_amount: data.recurringAmount,
    razorpay_subscription_id: data.razorpaySubscriptionId
  };
};

// Create subscription
export const createSubscription = async (subscription: Partial<Subscription>): Promise<Subscription> => {
  try {
    // Check for required fields
    if (!subscription.userId || !subscription.packageId) {
      throw new Error('userId and packageId are required');
    }
    
    const id = subscription.id || nanoid();
    const now = new Date().toISOString();
    
    // Prepare subscription data with defaults
    const subscriptionData = toSupabase({
      id,
      userId: subscription.userId,
      packageId: subscription.packageId,
      packageName: subscription.packageName || '',
      amount: subscription.amount || 0,
      startDate: subscription.startDate || now,
      endDate: subscription.endDate || now,
      status: subscription.status || 'active',
      paymentMethod: subscription.paymentMethod,
      transactionId: subscription.transactionId,
      cancelledAt: subscription.cancelledAt,
      cancelReason: subscription.cancelReason,
      paymentType: subscription.paymentType || 'recurring',
      billingCycle: subscription.billingCycle,
      signupFee: subscription.signupFee,
      recurringAmount: subscription.recurringAmount,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      createdAt: now,
      updatedAt: now
    });
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create subscription');
    }
    
    return fromSupabase(data[0]);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get subscription by ID
export const getSubscription = async (id: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select()
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? fromSupabase(data) : null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select();
    
    if (error) throw error;
    
    return data ? data.map(fromSupabase) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Update subscription
export const updateSubscription = async (id: string, subscription: Partial<Subscription>): Promise<Subscription | null> => {
  try {
    const subscriptionData = {
      ...toSupabase(subscription),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data && data.length > 0 ? fromSupabase(data[0]) : null;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return null;
  }
};

// Delete subscription
export const deleteSubscription = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return false;
  }
};

// Get subscriptions by user ID
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data ? data.map(fromSupabase) : [];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
};

// Get active user subscription
export const getActiveUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select()
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? fromSupabase(data) : null;
  } catch (error) {
    console.error('Error getting active user subscription:', error);
    return null;
  }
};

// Cancel subscription
export const cancelSubscription = async (id: string, reason?: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data && data.length > 0 ? fromSupabase(data[0]) : null;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return null;
  }
};
