
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { ISubscription, mapFromSupabase } from '@/models/Subscription';
import { SupabaseUserSubscriptionRow, SupabaseUserSubscriptionInsert } from '@/lib/supabase/types';

// Helper function to map ISubscription to database fields
const mapToSupabase = (subscription: Partial<ISubscription>): Record<string, any> => {
  return {
    id: subscription.id,
    user_id: subscription.userId,
    package_id: subscription.packageId,
    package_name: subscription.packageName,
    amount: subscription.amount,
    start_date: subscription.startDate,
    end_date: subscription.endDate,
    status: subscription.status,
    assigned_by: subscription.assignedBy,
    assigned_at: subscription.assignedAt,
    advance_payment_months: subscription.advancePaymentMonths,
    signup_fee: subscription.signupFee,
    actual_start_date: subscription.actualStartDate,
    is_paused: subscription.isPaused,
    is_pausable: subscription.isPausable,
    is_user_cancellable: subscription.isUserCancellable,
    invoice_ids: subscription.invoiceIds,
    payment_type: subscription.paymentType,
    payment_method: subscription.paymentMethod,
    transaction_id: subscription.transactionId,
    cancelled_at: subscription.cancelledAt,
    cancel_reason: subscription.cancelReason
  };
};

// Get a single subscription by ID
export const getSubscription = async (id: string): Promise<ISubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
  
  return data ? mapFromSupabase(data as SupabaseUserSubscriptionRow) : null;
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
  
  return data.map(subscription => mapFromSupabase(subscription as SupabaseUserSubscriptionRow));
};

// Create a new subscription
export const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>): Promise<ISubscription> => {
  // Generate ID if not provided
  const id = (subscriptionData as any).id || nanoid();
  
  const dbData = mapToSupabase({ ...subscriptionData, id });
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert(dbData as SupabaseUserSubscriptionInsert)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
  
  // Update user's subscription info
  await supabase
    .from('users')
    .update({
      subscription_id: id,
      subscription_status: subscriptionData.status,
      subscription_package: subscriptionData.packageId
    })
    .eq('id', subscriptionData.userId);
  
  return mapFromSupabase(data as SupabaseUserSubscriptionRow);
};

// Update an existing subscription
export const updateSubscription = async (id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription> => {
  const dbData = mapToSupabase({ ...subscriptionData, id });
  
  // Remove undefined values
  Object.keys(dbData).forEach(key => {
    if (dbData[key] === undefined) {
      delete dbData[key];
    }
  });
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  // Update user's subscription info if status changed
  if (subscriptionData.status && data.user_id) {
    await supabase
      .from('users')
      .update({
        subscription_status: subscriptionData.status
      })
      .eq('id', data.user_id);
  }
  
  return mapFromSupabase(data as SupabaseUserSubscriptionRow);
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_subscriptions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Get user subscriptions
export const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
  
  return data.map(subscription => mapFromSupabase(subscription as SupabaseUserSubscriptionRow));
};

// Get active user subscription
export const getActiveUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting active user subscription:', error);
    throw error;
  }
  
  return data ? mapFromSupabase(data as SupabaseUserSubscriptionRow) : null;
};
