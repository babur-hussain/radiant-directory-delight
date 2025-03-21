
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { nanoid } from 'nanoid';
import { PaymentType, BillingCycle } from '@/models/Subscription';

/**
 * Get all subscription packages
 */
export const getSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*');
    
    if (error) throw error;
    
    return data.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price,
      monthlyPrice: pkg.monthly_price,
      setupFee: pkg.setup_fee,
      durationMonths: pkg.duration_months,
      shortDescription: pkg.short_description || '',
      fullDescription: pkg.full_description || '',
      features: pkg.features || [],
      popular: pkg.popular,
      type: (pkg.type as 'Business' | 'Influencer') || 'Business',
      termsAndConditions: pkg.terms_and_conditions,
      paymentType: (pkg.payment_type as PaymentType) || 'recurring',
      billingCycle: pkg.billing_cycle as BillingCycle,
      advancePaymentMonths: pkg.advance_payment_months,
      dashboardSections: pkg.dashboard_sections || []
    }));
  } catch (error) {
    console.error('Error fetching subscription packages:', error);
    return [];
  }
};

/**
 * Get subscription packages by type
 */
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type);
    
    if (error) throw error;
    
    return data.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price,
      monthlyPrice: pkg.monthly_price,
      setupFee: pkg.setup_fee,
      durationMonths: pkg.duration_months,
      shortDescription: pkg.short_description || '',
      fullDescription: pkg.full_description || '',
      features: pkg.features || [],
      popular: pkg.popular,
      type: (pkg.type as 'Business' | 'Influencer') || 'Business',
      termsAndConditions: pkg.terms_and_conditions,
      paymentType: (pkg.payment_type as 'recurring' | 'one-time') || 'recurring',
      billingCycle: pkg.billing_cycle as 'monthly' | 'yearly' | undefined,
      advancePaymentMonths: pkg.advance_payment_months,
      dashboardSections: pkg.dashboard_sections || []
    }));
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    return [];
  }
};

/**
 * Create or update a subscription package
 */
export const createOrUpdatePackage = async (packageData: Partial<ISubscriptionPackage>): Promise<ISubscriptionPackage | null> => {
  try {
    // Ensure required fields
    if (!packageData.title || !packageData.price) {
      throw new Error('Title and price are required');
    }
    
    // Generate ID if not provided
    const id = packageData.id || nanoid();
    
    // Map package data to Supabase format
    const formattedData = {
      id,
      title: packageData.title,
      price: packageData.price,
      monthly_price: packageData.monthlyPrice,
      setup_fee: packageData.setupFee || 0,
      duration_months: packageData.durationMonths || 12,
      short_description: packageData.shortDescription,
      full_description: packageData.fullDescription,
      features: packageData.features || [],
      popular: packageData.popular || false,
      type: packageData.type || 'Business',
      terms_and_conditions: packageData.termsAndConditions,
      payment_type: packageData.paymentType || 'recurring',
      billing_cycle: packageData.billingCycle,
      advance_payment_months: packageData.advancePaymentMonths || 0,
      dashboard_sections: packageData.dashboardSections || []
    };
    
    const { data, error } = await supabase
      .from('subscription_packages')
      .upsert(formattedData)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const savedPackage = data[0];
    
    return {
      id: savedPackage.id,
      title: savedPackage.title,
      price: savedPackage.price,
      monthlyPrice: savedPackage.monthly_price,
      setupFee: savedPackage.setup_fee,
      durationMonths: savedPackage.duration_months,
      shortDescription: savedPackage.short_description || '',
      fullDescription: savedPackage.full_description || '',
      features: savedPackage.features || [],
      popular: savedPackage.popular,
      type: (savedPackage.type as 'Business' | 'Influencer') || 'Business',
      termsAndConditions: savedPackage.terms_and_conditions,
      paymentType: (savedPackage.payment_type as PaymentType) || 'recurring',
      billingCycle: savedPackage.billing_cycle as BillingCycle,
      advancePaymentMonths: savedPackage.advance_payment_months,
      dashboardSections: savedPackage.dashboard_sections || []
    };
  } catch (error) {
    console.error('Error creating/updating subscription package:', error);
    return null;
  }
};

/**
 * Delete a subscription package
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
    console.error('Error deleting subscription package:', error);
    return false;
  }
};

/**
 * Get user subscription
 */
export const getUserSubscription = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
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
      paymentType: data.payment_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

// Get active user subscription
export const getActiveUserSubscription = async (userId: string): Promise<any | null> => {
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
    
    if (!data) return null;
    
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
      paymentType: data.payment_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching active user subscription:', error);
    return null;
  }
};
