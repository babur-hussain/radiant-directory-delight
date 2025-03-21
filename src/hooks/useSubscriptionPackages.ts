
import { useQuery } from '@tanstack/react-query';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { getSubscriptionPackages } from '@/lib/supabase/subscriptionUtils';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionPackages = () => {
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: async (): Promise<ISubscriptionPackage[]> => {
      try {
        // First try to get packages from Supabase
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .order('price', { ascending: true });
        
        if (error) {
          console.error('Error fetching packages from Supabase:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          return data.map(pkg => ({
            id: pkg.id,
            title: pkg.title,
            price: pkg.price,
            monthlyPrice: pkg.monthly_price,
            setupFee: pkg.setup_fee || 0,
            durationMonths: pkg.duration_months || 12,
            shortDescription: pkg.short_description || '',
            fullDescription: pkg.full_description || '',
            features: pkg.features || [],
            popular: pkg.popular || false,
            type: pkg.type || 'Business',
            termsAndConditions: pkg.terms_and_conditions,
            paymentType: pkg.payment_type || 'recurring',
            billingCycle: pkg.billing_cycle,
            advancePaymentMonths: pkg.advance_payment_months || 0,
            dashboardSections: pkg.dashboard_sections || [],
            isActive: true
          }));
        }
        
        // Fallback to helper utility
        console.log('No packages found in Supabase, falling back to helper function');
        return getSubscriptionPackages();
      } catch (err) {
        console.error('Error in useSubscriptionPackages hook:', err);
        // Fallback to helper utility
        const packages = await getSubscriptionPackages();
        if (packages.length > 0) {
          return packages;
        }
        throw err;
      }
    }
  });

  return {
    packages,
    isLoading,
    isError,
    error,
    refetch
  };
};
