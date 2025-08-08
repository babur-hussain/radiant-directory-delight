
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { Subscription, PaymentType, BillingCycle } from '@/models/Subscription';
import { initiatePayUPayment } from '@/api/services/payuAPI';

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

const toSupabase = (subscription: Partial<Subscription>): any => {
  return {
    id: subscription.id,
    user_id: subscription.userId,
    package_id: subscription.packageId,
    package_name: subscription.packageName,
    amount: subscription.amount,
    start_date: subscription.startDate,
    end_date: subscription.endDate,
    status: subscription.status,
    payment_method: subscription.paymentMethod,
    transaction_id: subscription.transactionId,
    payment_type: subscription.paymentType,
    billing_cycle: subscription.billingCycle,
    signup_fee: subscription.signupFee,
    recurring_amount: subscription.recurringAmount,
    razorpay_subscription_id: subscription.razorpaySubscriptionId,
    created_at: subscription.createdAt,
    updated_at: subscription.updatedAt,
    is_paused: subscription.isPaused,
    is_pausable: subscription.isPausable,
    is_user_cancellable: subscription.isUserCancellable,
    assigned_by: subscription.assignedBy,
    assigned_at: subscription.assignedAt,
    advance_payment_months: subscription.advancePaymentMonths,
    actual_start_date: subscription.actualStartDate,
    invoice_ids: subscription.invoiceIds,
    next_billing_date: subscription.nextBillingDate,
    razorpay_order_id: subscription.razorpayOrderId
  };
};

// Enhanced subscription service with autopay support
export const getSubscriptions = async (userId?: string): Promise<Subscription[]> => {
  try {
    let query = supabase.from('subscriptions').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data ? data.map(fromSupabase) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data ? fromSupabase(data) : null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

export const createSubscription = async (subscription: Partial<Subscription>): Promise<Subscription> => {
  try {
    const now = new Date();
    const isOneTime = subscription.paymentType === 'one-time';
    
    // Calculate end date based on payment type
    const endDate = new Date(now);
    if (isOneTime) {
      const durationMonths = subscription.durationMonths || 12;
      endDate.setMonth(endDate.getMonth() + durationMonths);
    } else {
      const billingCycle = subscription.billingCycle || 'monthly';
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }
    
    // Calculate next billing date for recurring payments
    let nextBillingDate = null;
    if (!isOneTime) {
      nextBillingDate = new Date(now);
      const billingCycle = subscription.billingCycle || 'monthly';
      if (billingCycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }
    }
    
    const subscriptionData = {
      id: subscription.id || nanoid(),
      user_id: subscription.userId,
      package_id: subscription.packageId,
      package_name: subscription.packageName,
      amount: subscription.amount,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      payment_method: 'payu',
      payment_type: subscription.paymentType || 'recurring',
      billing_cycle: subscription.billingCycle,
      signup_fee: subscription.signupFee || 0,
      recurring_amount: subscription.recurringAmount,
      advance_payment_months: subscription.advancePaymentMonths || 0,
      next_billing_date: nextBillingDate?.toISOString() || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    const { data, error } = await supabase.from('subscriptions').insert(subscriptionData).select().single();
    
    if (error) throw error;
    
    return fromSupabase(data);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> => {
  try {
    const now = new Date();
    const updateData = toSupabase({
      ...updates,
      updatedAt: now.toISOString()
    });
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return fromSupabase(data);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Autopay system for recurring subscriptions
export const processRecurringPayment = async (subscription: Subscription, user: any): Promise<boolean> => {
  try {
    if (subscription.paymentType !== 'recurring') {
      console.log('Not a recurring subscription, skipping autopay');
      return false;
    }
    
    const now = new Date();
    const nextBilling = subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : null;
    
    if (!nextBilling || now < nextBilling) {
      console.log('Not time for recurring payment yet');
      return false;
    }
    
    console.log('Processing recurring payment for subscription:', subscription.id);
    
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', subscription.packageId)
      .single();
    
    if (packageError || !packageData) {
      console.error('Package not found for recurring payment');
      return false;
    }
    
    // Calculate recurring amount based on billing cycle
    let recurringAmount = 0;
    if (packageData.billing_cycle === 'monthly') {
      recurringAmount = packageData.monthly_price || packageData.price;
    } else {
      recurringAmount = packageData.price;
    }
    
    // Add setup fee for first payment if applicable
    const isFirstPayment = !subscription.actualStartDate;
    const totalAmount = isFirstPayment ? recurringAmount + (packageData.setup_fee || 0) : recurringAmount;
    
    // Initiate PayU payment for recurring charge
    const txnid = 'recurring_' + Date.now() + '_' + subscription.id;
    const paymentData = {
      key: 'JPMALL',
      salt: 'HnM0HqM1',
      txnid: txnid,
      amount: totalAmount,
      productinfo: `Recurring Payment - ${packageData.title} (${packageData.billing_cycle || 'monthly'})`,
      firstname: user.name || 'User',
      email: user.email,
      phone: user.phone || '',
      surl: `${window.location.origin}/payment-success`,
      furl: `${window.location.origin}/`,
      udf1: user.id,
      udf2: packageData.id,
      udf3: 'recurring_payment',
      udf4: subscription.paymentType,
      udf5: subscription.billingCycle || packageData.billing_cycle,
      udf6: packageData.type,
      udf7: packageData.setup_fee?.toString() || '0',
      udf8: packageData.duration_months?.toString() || '12',
      udf9: packageData.advance_payment_months?.toString() || '0',
      udf10: packageData.monthly_price?.toString() || '0',
    };
    
    // Call PayU API with retry logic
    let payuParams;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        payuParams = await initiatePayUPayment(paymentData);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Store payment details
    sessionStorage.setItem('payu_recurring_payment', JSON.stringify({
      subscriptionId: subscription.id,
      packageId: subscription.packageId,
      amount: totalAmount,
      txnid,
      userEmail: user.email,
      userName: user.name,
      isRecurring: true,
      billingCycle: subscription.billingCycle || packageData.billing_cycle,
      isFirstPayment
    }));
    
    // Submit payment form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payuParams.payuBaseUrl;
    
    Object.entries(payuParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
    });
    
    document.body.appendChild(form);
    form.submit();
    
    return true;
  } catch (error) {
    console.error('Error processing recurring payment:', error);
    return false;
  }
};

// Update subscription after successful recurring payment
export const updateSubscriptionAfterRecurringPayment = async (subscriptionId: string): Promise<boolean> => {
  try {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
      console.error('Subscription not found for update');
      return false;
    }
    
    const now = new Date();
    const newEndDate = new Date(subscription.endDate);
    const newNextBilling = new Date(subscription.nextBillingDate || subscription.endDate);
    
    // Extend subscription based on billing cycle
    if (subscription.billingCycle === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      newNextBilling.setMonth(newNextBilling.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      newNextBilling.setFullYear(newNextBilling.getFullYear() + 1);
    }
    
    // Update subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        end_date: newEndDate.toISOString(),
        next_billing_date: newNextBilling.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    console.log('Subscription updated after recurring payment');
    return true;
  } catch (error) {
    console.error('Error updating subscription after recurring payment:', error);
    return false;
  }
};

// Check for subscriptions that need recurring payments
export const checkRecurringPayments = async (): Promise<void> => {
  try {
    const now = new Date();
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('payment_type', 'recurring')
      .eq('status', 'active')
      .not('next_billing_date', 'is', null)
      .lte('next_billing_date', now.toISOString());
    
    if (error) {
      // Handle case where subscriptions table doesn't exist yet
      if (error.code === 'PGRST116' || error.message?.includes('404')) {
        console.log('Subscriptions table not found - skipping recurring payment check');
        return;
      }
      throw error;
    }
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions needing recurring payments`);
    
    for (const subscriptionData of subscriptions || []) {
      const subscription = fromSupabase(subscriptionData);
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', subscription.userId)
        .single();
      
      if (userError || !userData) {
        console.error('User not found for recurring payment:', subscription.userId);
        continue;
      }
      
      // Process recurring payment
      await processRecurringPayment(subscription, userData);
    }
  } catch (error) {
    console.error('Error checking recurring payments:', error);
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string, reason?: string): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        cancel_reason: reason || 'User cancelled',
        updated_at: now
      })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};

// Pause subscription
export const pauseSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        is_paused: true,
        paused_at: now,
        updated_at: now
      })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return false;
  }
};

// Resume subscription
export const resumeSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        is_paused: false,
        resumed_at: now,
        updated_at: now
      })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return false;
  }
};
