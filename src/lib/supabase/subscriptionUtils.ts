import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { ISubscription, SubscriptionStatus, PaymentType, BillingCycle } from '@/models/Subscription';
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

// Helper to ensure billing cycle is valid
const transformBillingCycle = (cycle: string | null): BillingCycle => {
  if (cycle?.toLowerCase() === 'monthly') return 'monthly';
  if (cycle?.toLowerCase() === 'yearly') return 'yearly';
  return undefined; // Default value for BillingCycle
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
    
    return data ? data.map(pkg => {
      // Parse features from JSON string if needed
      let features: string[] = [];
      try {
        if (typeof pkg.features === 'string' && pkg.features) {
          features = JSON.parse(pkg.features);
        } else if (Array.isArray(pkg.features)) {
          features = pkg.features;
        }
      } catch (e) {
        console.warn("Error parsing features:", e);
      }
      
      // Parse dashboard sections from JSON string if needed
      let dashboardSections: string[] = [];
      try {
        if (typeof pkg.dashboard_sections === 'string' && pkg.dashboard_sections) {
          dashboardSections = JSON.parse(pkg.dashboard_sections);
        } else if (Array.isArray(pkg.dashboard_sections)) {
          dashboardSections = pkg.dashboard_sections;
        }
      } catch (e) {
        console.warn("Error parsing dashboard_sections:", e);
      }
      
      return {
        id: pkg.id,
        title: pkg.title || '',
        price: pkg.price || 0,
        monthlyPrice: pkg.monthly_price,
        setupFee: pkg.setup_fee || 0,
        durationMonths: pkg.duration_months || 12,
        shortDescription: pkg.short_description || '',
        fullDescription: pkg.full_description || '',
        features: features,
        popular: pkg.popular || false,
        type: transformType(pkg.type),
        termsAndConditions: pkg.terms_and_conditions,
        paymentType: transformPaymentType(pkg.payment_type),
        billingCycle: transformBillingCycle(pkg.billing_cycle),
        advancePaymentMonths: pkg.advance_payment_months || 0,
        dashboardSections: dashboardSections
      };
    }) : [];
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
    
    return data ? data.map(pkg => {
      // Parse features from JSON string if needed
      let features: string[] = [];
      try {
        if (typeof pkg.features === 'string' && pkg.features) {
          features = JSON.parse(pkg.features);
        } else if (Array.isArray(pkg.features)) {
          features = pkg.features;
        }
      } catch (e) {
        console.warn("Error parsing features:", e);
      }
      
      // Parse dashboard sections from JSON string if needed
      let dashboardSections: string[] = [];
      try {
        if (typeof pkg.dashboard_sections === 'string' && pkg.dashboard_sections) {
          dashboardSections = JSON.parse(pkg.dashboard_sections);
        } else if (Array.isArray(pkg.dashboard_sections)) {
          dashboardSections = pkg.dashboard_sections;
        }
      } catch (e) {
        console.warn("Error parsing dashboard_sections:", e);
      }
      
      return {
        id: pkg.id,
        title: pkg.title || '',
        price: pkg.price || 0,
        monthlyPrice: pkg.monthly_price,
        setupFee: pkg.setup_fee || 0,
        durationMonths: pkg.duration_months || 12,
        shortDescription: pkg.short_description || '',
        fullDescription: pkg.full_description || '',
        features: features,
        popular: pkg.popular || false,
        type: transformType(pkg.type),
        termsAndConditions: pkg.terms_and_conditions,
        paymentType: transformPaymentType(pkg.payment_type),
        billingCycle: transformBillingCycle(pkg.billing_cycle),
        advancePaymentMonths: pkg.advance_payment_months || 0,
        dashboardSections: dashboardSections
      };
    }) : [];
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
    
    // Process features array
    let featuresString = '';
    if (Array.isArray(packageData.features)) {
      featuresString = JSON.stringify(packageData.features);
    } else if (typeof packageData.features === 'string') {
      // If it's already a string, check if it's JSON format
      try {
        JSON.parse(packageData.features as string);
        featuresString = packageData.features as string;
      } catch (e) {
        // Not valid JSON, convert to array then stringify
        featuresString = JSON.stringify((packageData.features as unknown as string).split(',').map(f => f.trim()));
      }
    } else {
      featuresString = JSON.stringify([]);
    }
    
    // Process dashboard sections array
    let dashboardSectionsString = '';
    if (Array.isArray(packageData.dashboardSections)) {
      dashboardSectionsString = JSON.stringify(packageData.dashboardSections);
    } else {
      dashboardSectionsString = JSON.stringify([]);
    }
    
    // Prepare the data for Supabase (snake_case)
    const supabaseData = {
      id: packageData.id,
      title: packageData.title,
      price: packageData.price,
      monthly_price: packageData.monthlyPrice || 0,
      setup_fee: packageData.setupFee || 0,
      duration_months: packageData.durationMonths || 12,
      short_description: packageData.shortDescription || '',
      full_description: packageData.fullDescription || '',
      features: featuresString,
      popular: packageData.popular || false,
      type: packageData.type || 'Business',
      terms_and_conditions: packageData.termsAndConditions || '',
      payment_type: packageData.paymentType || 'recurring',
      billing_cycle: packageData.billingCycle || undefined,
      advance_payment_months: packageData.advancePaymentMonths || 0,
      dashboard_sections: dashboardSectionsString
    };
    
    console.log("Supabase data to save:", JSON.stringify(supabaseData, null, 2));
    
    const { data, error } = await supabase
      .from('subscription_packages')
      .upsert(supabaseData)
      .select();
    
    if (error) throw error;
    
    return data && data.length > 0 ? {
      ...packageData,
      // Ensure the correct type
      type: transformType(data[0].type)
    } : null;
  } catch (error) {
    console.error("Error creating/updating subscription package:", error);
    throw error;
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
        packageName: data.package_name || 'Subscription',
        amount: data.amount,
        startDate: data.start_date,
        endDate: data.end_date,
        status: transformStatus(data.status),
        paymentMethod: data.payment_method,
        transactionId: data.transaction_id,
        paymentType: transformPaymentType(data.payment_type),
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
        packageName: 'Subscription', // Add required packageName
        status: transformStatus(userData.subscription_status || ''),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        amount: 0,
        paymentType: 'recurring'
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
