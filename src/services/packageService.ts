
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPackage, ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { PaymentType, BillingCycle } from '@/models/Subscription';

// Helper function to ensure payment type is valid
const getPaymentType = (type: string | null): PaymentType => {
  return (type?.toLowerCase() === 'one-time') ? 'one-time' : 'recurring';
};

// Helper function to ensure billing cycle is valid
const getBillingCycle = (cycle: string | null): BillingCycle | undefined => {
  if (cycle?.toLowerCase() === 'monthly') return 'monthly';
  if (cycle?.toLowerCase() === 'yearly') return 'yearly';
  return undefined;
};

// Map a Supabase row to an ISubscriptionPackage object
const mapToPackage = (pkg: any): ISubscriptionPackage => {
  return {
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
    type: pkg.type as "Business" | "Influencer" || 'Business',
    termsAndConditions: pkg.terms_and_conditions,
    paymentType: getPaymentType(pkg.payment_type),
    billingCycle: getBillingCycle(pkg.billing_cycle),
    advancePaymentMonths: pkg.advance_payment_months || 0,
    dashboardSections: pkg.dashboard_sections || [],
    createdAt: pkg.created_at,
    updatedAt: pkg.updated_at,
    isActive: pkg.is_active !== undefined ? pkg.is_active : true,
    maxBusinesses: pkg.max_businesses || 1,
    maxInfluencers: pkg.max_influencers || 1
  };
};

// Get all subscription packages
export const getAllPackages = async (): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) {
    console.error('Error fetching subscription packages:', error);
    throw error;
  }
  
  return data.map(mapToPackage);
};

// Get packages by type
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('type', type)
    .order('price', { ascending: true });
  
  if (error) {
    console.error(`Error fetching ${type} packages:`, error);
    throw error;
  }
  
  return data.map(mapToPackage);
};

// Get package by ID
export const getPackageById = async (id: string): Promise<ISubscriptionPackage | null> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching package by ID ${id}:`, error);
    throw error;
  }
  
  if (!data) return null;
  
  return mapToPackage(data);
};

// Create or update package
export const savePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  // Ensure package has an ID
  if (!packageData.id) {
    packageData.id = packageData.title.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Convert features to array if it's a string
  if (typeof packageData.features === 'string') {
    packageData.features = (packageData.features as unknown as string).split(',').map((f: string) => f.trim());
  } else if (!Array.isArray(packageData.features)) {
    packageData.features = [];
  }

  // Prepare the data for Supabase (snake_case)
  const supabaseData = {
    id: packageData.id,
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
    dashboard_sections: packageData.dashboardSections,
    is_active: packageData.isActive,
    max_businesses: packageData.maxBusinesses,
    max_influencers: packageData.maxInfluencers
  };
  
  const { data, error } = await supabase
    .from('subscription_packages')
    .upsert(supabaseData, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving subscription package:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('No data returned after saving package');
  }
  
  return mapToPackage(data[0]);
};

// Delete package
export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscription_packages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting package with ID ${id}:`, error);
    throw error;
  }
};
