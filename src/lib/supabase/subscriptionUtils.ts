
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { ISubscription, SubscriptionStatus, PaymentType } from '@/models/Subscription';
import { User } from '@/types/auth';

// Helper to ensure correct type casting
const transformType = (type: string): 'Business' | 'Influencer' => {
  if (type?.toLowerCase() === 'influencer') return 'Influencer';
  return 'Business'; // Default or invalid value becomes 'Business'
};

// Helper to ensure correct payment type casting
const transformPaymentType = (type: string): PaymentType => {
  if (type?.toLowerCase() === 'one-time') return 'one-time';
  return 'recurring'; // Default
};

// Helper to ensure subscription status is valid
const transformStatus = (status: string): SubscriptionStatus => {
  switch (status?.toLowerCase()) {
    case 'active': return 'active';
    case 'pending': return 'pending';
    case 'cancelled': return 'cancelled';
    case 'expired': return 'expired';
    case 'trial': return 'trial';
    case 'paused': return 'paused';
    default: return 'active'; // Default to active
  }
};

/**
 * Gets subscription packages from Supabase
 */
export const getSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*');
    
    if (error) throw error;
    
    return data ? data.map(pkg => ({
      id: pkg.id,
      title: pkg.title || '',
      price: pkg.price || 0,
      monthlyPrice: pkg.monthly_price,
      setupFee: pkg.setup_fee || 0,
      durationMonths: pkg.duration_months || 12,
      shortDescription: pkg.short_description || '',
      fullDescription: pkg.full_description || '',
      features: Array.isArray(pkg.features) ? pkg.features : [],
      popular: pkg.popular || false,
      type: transformType(pkg.type), // Fix: ensure type is valid
      termsAndConditions: pkg.terms_and_conditions,
      paymentType: transformPaymentType(pkg.payment_type), // Fix: ensure paymentType is valid
      billingCycle: pkg.billing_cycle,
      advancePaymentMonths: pkg.advance_payment_months || 0,
      dashboardSections: pkg.dashboard_sections || []
    })) : [];
  } catch (error) {
    console.error("Error getting subscription packages:", error);
    return [];
  }
};

/**
 * Gets subscription packages by type from Supabase
 */
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type);
    
    if (error) throw error;
    
    return data ? data.map(pkg => ({
      id: pkg.id,
      title: pkg.title || '',
      price: pkg.price || 0,
      monthlyPrice: pkg.monthly_price,
      setupFee: pkg.setup_fee || 0,
      durationMonths: pkg.duration_months || 12,
      shortDescription: pkg.short_description || '',
      fullDescription: pkg.full_description || '',
      features: Array.isArray(pkg.features) ? pkg.features : [],
      popular: pkg.popular || false,
      type: transformType(pkg.type), // Fix: ensure type is valid
      termsAndConditions: pkg.terms_and_conditions,
      paymentType: transformPaymentType(pkg.payment_type), // Fix: ensure paymentType is valid
      billingCycle: pkg.billing_cycle,
      advancePaymentMonths: pkg.advance_payment_months || 0,
      dashboardSections: pkg.dashboard_sections || []
    })) : [];
  } catch (error) {
    console.error(`Error getting ${type} subscription packages:`, error);
    return [];
  }
};

/**
 * Creates or updates a subscription package in Supabase
 */
export const createOrUpdatePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage | null> => {
  try {
    // Ensure all required fields are present
    if (!packageData.id || !packageData.title || packageData.price === undefined) {
      throw new Error("Missing required package data");
    }
    
    // Format features if it's a string
    if (typeof packageData.features === 'string') {
      packageData.features = (packageData.features as any).split(',').map((f: string) => f.trim());
    }
    
    const { data, error } = await supabase
      .from('subscription_packages')
      .upsert([packageData])
      .select();
    
    if (error) throw error;
    
    return data && data.length > 0 ? {
      ...packageData,
      // Ensure the correct type
      type: transformType(data[0].type)
    } : null;
  } catch (error) {
    console.error("Error creating/updating subscription package:", error);
    return null;
  }
};

/**
 * Deletes a subscription package from Supabase
 */
export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting subscription package with ID ${id}:`, error);
    return false;
  }
};

/**
 * Gets a user's subscription from Supabase
 */
export const getUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  try {
    // First try to get from user_subscriptions table
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();
    
    if (error) {
      console.error(`Error getting subscription for user ${userId}:`, error);
      // Don't throw, try the next method
    }
    
    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        packageId: data.package_id,
        packageName: data.package_name,
        amount: data.amount,
        startDate: data.start_date,
        endDate: data.end_date,
        status: transformStatus(data.status), // Fix: ensure status is valid
        paymentMethod: data.payment_method,
        transactionId: data.transaction_id,
        paymentType: transformPaymentType(data.payment_type), // Fix: ensure payment type is valid
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        cancelledAt: data.cancelled_at,
        cancelReason: data.cancel_reason,
        assignedBy: data.assigned_by,
        assignedAt: data.assigned_at,
        advancePaymentMonths: data.advance_payment_months,
        signupFee: data.signup_fee,
        actualStartDate: data.actual_start_date,
        isPaused: data.is_paused,
        isPausable: data.is_pausable,
        isUserCancellable: data.is_user_cancellable,
        invoiceIds: data.invoice_ids
      };
    }
    
    // If not found, check the user table for subscription info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription, subscription_id, subscription_status, subscription_package')
      .eq('id', userId)
      .maybeSingle();
    
    if (userError) {
      console.error(`Error getting user ${userId} for subscription info:`, userError);
      return null;
    }
    
    if (userData && userData.subscription_id) {
      // Create a simple subscription object from user data
      return {
        id: userData.subscription_id,
        userId: userId,
        packageId: userData.subscription_package || '',
        status: transformStatus(userData.subscription_status || ''), // Fix: ensure status is valid
        startDate: new Date().toISOString(), // Default values
        endDate: new Date().toISOString(),
        amount: 0,
        paymentType: 'recurring' // Default payment type
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting subscription for user ${userId}:`, error);
    return null;
  }
};

/**
 * Assigns a subscription to a user
 */
export const assignSubscription = async (
  userId: string, 
  packageId: string, 
  packageName: string,
  amount: number,
  startDate: string,
  endDate: string,
  assignedBy: string = 'admin'
): Promise<boolean> => {
  try {
    const subscriptionId = `sub_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create subscription record
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([{
        id: subscriptionId,
        user_id: userId,
        package_id: packageId,
        package_name: packageName,
        amount: amount,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        assigned_by: assignedBy,
        assigned_at: now,
        created_at: now,
        updated_at: now
      }]);
    
    if (subscriptionError) throw subscriptionError;
    
    // Update user record with subscription info
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_package: packageId,
        updated_at: now
      })
      .eq('id', userId);
    
    if (userError) throw userError;
    
    return true;
  } catch (error) {
    console.error(`Error assigning subscription to user ${userId}:`, error);
    return false;
  }
};

/**
 * Cancels a user's subscription
 */
export const cancelSubscription = async (userId: string, reason: string = 'user_cancelled'): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (subError) throw subError;
    
    if (subscription) {
      // Update subscription record
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          cancel_reason: reason,
          updated_at: now
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;
    }
    
    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        updated_at: now
      })
      .eq('id', userId);
    
    if (userError) throw userError;
    
    return true;
  } catch (error) {
    console.error(`Error cancelling subscription for user ${userId}:`, error);
    return false;
  }
};
