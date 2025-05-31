
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { Subscription, PaymentType, BillingCycle } from '@/models/Subscription';

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
    updatedAt: data.updated_at,
    isPaused: data.is_paused,
    isPausable: data.is_pausable,
    isUserCancellable: data.is_user_cancellable,
    assignedBy: data.assigned_by,
    assignedAt: data.assigned_at,
    advancePaymentMonths: data.advance_payment_months,
    actualStartDate: data.actual_start_date,
    invoiceIds: data.invoice_ids,
    nextBillingDate: data.next_billing_date,
    razorpayOrderId: data.razorpay_order_id
  };
};

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
    razorpay_subscription_id: data.razorpaySubscriptionId,
    is_paused: data.isPaused,
    is_pausable: data.isPausable,
    is_user_cancellable: data.isUserCancellable,
    assigned_by: data.assignedBy,
    assigned_at: data.assignedAt,
    advance_payment_months: data.advancePaymentMonths,
    actual_start_date: data.actualStartDate,
    invoice_ids: data.invoiceIds,
    next_billing_date: data.nextBillingDate,
    razorpay_order_id: data.razorpayOrderId
  };
};

export const createSubscription = async (subscription: Partial<Subscription>): Promise<Subscription> => {
  try {
    if (!subscription.userId || !subscription.packageId) {
      throw new Error('userId and packageId are required');
    }
    
    const id = subscription.id || nanoid();
    const now = new Date().toISOString();
    const isOneTime = subscription.paymentType === 'one-time';
    
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    const durationMonths = subscription.billingCycle === 'monthly' ? 1 : 12;
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    // For one-time payments, set as non-cancellable and non-pausable
    const subscriptionData = toSupabase({
      id,
      userId: subscription.userId,
      packageId: subscription.packageId,
      packageName: subscription.packageName || '',
      amount: subscription.amount || 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: subscription.status || 'active',
      paymentMethod: subscription.paymentMethod || 'razorpay',
      transactionId: subscription.transactionId,
      paymentType: subscription.paymentType || 'recurring',
      billingCycle: subscription.billingCycle || 'monthly',
      recurringAmount: subscription.recurringAmount || subscription.amount,
      signupFee: subscription.signupFee || 0,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      razorpayOrderId: subscription.razorpayOrderId,
      isPaused: false,
      isPausable: isOneTime ? false : true,
      isUserCancellable: isOneTime ? false : true,
      assignedBy: subscription.assignedBy || 'system',
      assignedAt: now,
      actualStartDate: startDate.toISOString(),
      nextBillingDate: subscription.billingCycle === 'monthly' ? endDate.toISOString() : null,
      createdAt: now,
      updatedAt: now
    });
    
    // Insert subscription record
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();
    
    if (subError) throw subError;
    
    // Update user profile with subscription details
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_id: id,
        subscription_status: 'active',
        subscription_package: subscription.packageId,
        subscription_assigned_at: now,
        last_updated: now
      })
      .eq('id', subscription.userId);
    
    if (userError) {
      console.error('Error updating user profile:', userError);
      // Don't throw here, subscription is created successfully
    }
    
    return fromSupabase(subData);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const getActiveUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? fromSupabase(data) : null;
  } catch (error) {
    console.error(`Error getting active subscription for user ${userId}:`, error);
    return null;
  }
};

export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data ? data.map(fromSupabase) : [];
  } catch (error) {
    console.error(`Error getting subscriptions for user ${userId}:`, error);
    return [];
  }
};

export const updateSubscription = async (id: string, subscription: Partial<Subscription>): Promise<Subscription | null> => {
  try {
    const data = toSupabase({
      ...subscription,
      updatedAt: new Date().toISOString()
    });
    
    const { data: result, error } = await supabase
      .from('user_subscriptions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user profile if status changed
    if (subscription.status) {
      await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          last_updated: new Date().toISOString(),
          ...(subscription.status === 'cancelled' && {
            subscription_cancelled_at: new Date().toISOString()
          })
        })
        .eq('id', result.user_id);
    }
    
    return fromSupabase(result);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return null;
  }
};

export const cancelSubscription = async (id: string, reason: string = 'user_cancelled'): Promise<boolean> => {
  try {
    // First check if this subscription can be cancelled
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('payment_type, is_user_cancellable, user_id')
      .eq('id', id)
      .single();
    
    if (subError) throw subError;
    
    // Block cancellation for one-time payments or if explicitly marked as not user-cancellable
    if (subData?.payment_type === 'one-time' || subData?.is_user_cancellable === false) {
      console.log("Cancellation prevented for subscription", id, "- one-time payment or not user-cancellable");
      throw new Error('This subscription cannot be cancelled.');
    }
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        cancel_reason: reason,
        updated_at: now
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // Update user profile
    if (data && data.length > 0) {
      await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled',
          subscription_cancelled_at: now,
          last_updated: now
        })
        .eq('id', subData.user_id);
    }
    
    return true;
  } catch (error) {
    console.error(`Error cancelling subscription ${id}:`, error);
    return false;
  }
};
