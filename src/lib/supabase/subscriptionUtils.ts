
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  setupFee?: number;
  durationMonths: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  popular?: boolean;
  type: string;
  termsAndConditions?: string;
  paymentType: string;
  billingCycle?: string;
  advancePaymentMonths?: number;
  dashboardSections?: string[];
}

// Get all subscription packages
export const getSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*');
  
  if (error) {
    console.error('Error getting subscription packages:', error);
    throw error;
  }
  
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
    type: pkg.type || 'Business',
    termsAndConditions: pkg.terms_and_conditions,
    paymentType: pkg.payment_type || 'recurring',
    billingCycle: pkg.billing_cycle,
    advancePaymentMonths: pkg.advance_payment_months,
    dashboardSections: pkg.dashboard_sections || []
  }));
};

// Get packages by type
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('type', type);
  
  if (error) {
    console.error(`Error getting ${type} subscription packages:`, error);
    throw error;
  }
  
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
    type: pkg.type || 'Business',
    termsAndConditions: pkg.terms_and_conditions,
    paymentType: pkg.payment_type || 'recurring',
    billingCycle: pkg.billing_cycle,
    advancePaymentMonths: pkg.advance_payment_months,
    dashboardSections: pkg.dashboard_sections || []
  }));
};

// Create or update a package
export const createOrUpdatePackage = async (packageData: Partial<ISubscriptionPackage>): Promise<ISubscriptionPackage> => {
  if (!packageData.title || packageData.price === undefined) {
    throw new Error("Package title and price are required");
  }
  
  // Generate ID if not provided
  const id = packageData.id || nanoid();
  
  // Map package data to Supabase format
  const supabaseData = {
    id,
    title: packageData.title,
    price: packageData.price,
    monthly_price: packageData.monthlyPrice,
    setup_fee: packageData.setupFee,
    duration_months: packageData.durationMonths,
    short_description: packageData.shortDescription,
    full_description: packageData.fullDescription,
    features: packageData.features,
    popular: packageData.popular,
    type: packageData.type,
    terms_and_conditions: packageData.termsAndConditions,
    payment_type: packageData.paymentType,
    billing_cycle: packageData.billingCycle,
    advance_payment_months: packageData.advancePaymentMonths,
    dashboard_sections: packageData.dashboardSections
  };
  
  const { data, error } = await supabase
    .from('subscription_packages')
    .upsert([supabaseData], { onConflict: 'id', returning: 'representation' });
  
  if (error) {
    console.error('Error creating/updating subscription package:', error);
    throw error;
  }
  
  const savedPackage = data?.[0];
  
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
    type: savedPackage.type || 'Business',
    termsAndConditions: savedPackage.terms_and_conditions,
    paymentType: savedPackage.payment_type || 'recurring',
    billingCycle: savedPackage.billing_cycle,
    advancePaymentMonths: savedPackage.advance_payment_months,
    dashboardSections: savedPackage.dashboard_sections || []
  };
};

// Delete a package
export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscription_packages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subscription package:', error);
    throw error;
  }
};

// Get user subscription
export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
  
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
    assignedBy: data.assigned_by,
    assignedAt: data.assigned_at,
    advancePaymentMonths: data.advance_payment_months,
    signupFee: data.signup_fee,
    actualStartDate: data.actual_start_date,
    isPaused: data.is_paused,
    isPausable: data.is_pausable,
    isUserCancellable: data.is_user_cancellable,
    invoiceIds: data.invoice_ids,
    paymentType: data.payment_type,
    paymentMethod: data.payment_method,
    transactionId: data.transaction_id,
    cancelledAt: data.cancelled_at,
    cancelReason: data.cancel_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
