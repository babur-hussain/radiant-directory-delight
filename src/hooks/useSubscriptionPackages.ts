
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  type: 'Business' | 'Influencer';
  termsAndConditions?: string;
  paymentType: 'recurring' | 'one-time';
  billingCycle?: 'monthly' | 'yearly';
  advancePaymentMonths?: number;
  dashboardSections?: string[];
}

// Function to fetch subscription packages from Supabase
const fetchPackages = async (): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*');
  
  if (error) {
    console.error('Error fetching subscription packages:', error);
    throw error;
  }
  
  return data.map(pkg => ({
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    monthlyPrice: pkg.monthly_price || undefined,
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
};

// Function to fetch packages by type
const fetchPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('*')
    .eq('type', type);
  
  if (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
  
  return data.map(pkg => ({
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    monthlyPrice: pkg.monthly_price || undefined,
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
};

// Function to create or update a package
const savePackage = async (packageData: Partial<ISubscriptionPackage>): Promise<ISubscriptionPackage> => {
  // Generate ID if not provided
  const id = packageData.id || nanoid();
  
  // Map package data to Supabase format
  const supabaseData = {
    id,
    title: packageData.title,
    price: packageData.price,
    monthly_price: packageData.monthlyPrice,
    setup_fee: packageData.setupFee || 0,
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
    .upsert(supabaseData)
    .select();
  
  if (error) {
    console.error('Error saving subscription package:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('No data returned after saving package');
  }
  
  const savedPackage = data[0];
  
  return {
    id: savedPackage.id,
    title: savedPackage.title,
    price: savedPackage.price,
    monthlyPrice: savedPackage.monthly_price || undefined,
    setupFee: savedPackage.setup_fee,
    durationMonths: savedPackage.duration_months,
    shortDescription: savedPackage.short_description || '',
    fullDescription: savedPackage.full_description || '',
    features: savedPackage.features || [],
    popular: savedPackage.popular,
    type: (savedPackage.type as 'Business' | 'Influencer') || 'Business',
    termsAndConditions: savedPackage.terms_and_conditions,
    paymentType: (savedPackage.payment_type as 'recurring' | 'one-time') || 'recurring',
    billingCycle: savedPackage.billing_cycle as 'monthly' | 'yearly' | undefined,
    advancePaymentMonths: savedPackage.advance_payment_months,
    dashboardSections: savedPackage.dashboard_sections || []
  };
};

// Function to delete a package
const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscription_packages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subscription package:', error);
    throw error;
  }
};

// Hook for managing subscription packages
export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch all packages
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: fetchPackages
  });
  
  // Mutation for creating/updating packages
  const createOrUpdateMutation = useMutation({
    mutationFn: savePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    }
  });
  
  // Mutation for deleting packages
  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    }
  });
  
  // Query to check server status (optional)
  const serverStatus = true; // Since we're using Supabase, we can assume the server is available
  
  return {
    packages: data,
    isLoading,
    isError,
    error,
    refetch,
    createOrUpdate: createOrUpdateMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createOrUpdateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    serverStatus
  };
};

// Hook to fetch packages by type
export const useSubscriptionPackagesByType = (type: string) => {
  return useQuery({
    queryKey: ['subscription-packages', type],
    queryFn: () => fetchPackagesByType(type)
  });
};
