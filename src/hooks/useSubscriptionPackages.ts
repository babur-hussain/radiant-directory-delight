
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscriptionPackages = () => {
  const {
    data: packages = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: async () => {
      console.log("🔍 Fetching subscription packages from Supabase...");
      
      // Get packages from Supabase only
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Raw data from Supabase:', data);
      
      if (!data || data.length === 0) {
        console.log('⚠️ No packages found in database');
        return [];
      }
      
      // Map Supabase data to our interface
      const mappedPackages: ISubscriptionPackage[] = data.map((pkg): ISubscriptionPackage => {
        let features: string[] = [];
        if (pkg.features) {
          if (typeof pkg.features === 'string') {
            try {
              features = JSON.parse(pkg.features);
            } catch {
              features = [pkg.features];
            }
          } else if (Array.isArray(pkg.features)) {
            features = pkg.features;
          }
        }
        
        if (features.length === 0) {
          features = ['Access to platform'];
        }
        
        return {
          id: pkg.id || '',
          title: pkg.title || 'Package',
          price: pkg.price || 0,
          monthlyPrice: pkg.monthly_price || pkg.price || 0,
          setupFee: pkg.setup_fee || 0,
          durationMonths: pkg.duration_months || 12,
          shortDescription: pkg.short_description || '',
          fullDescription: pkg.full_description || '',
          features: features,
          popular: pkg.popular || false,
          type: pkg.type === 'Influencer' ? 'Influencer' : 'Business',
          termsAndConditions: pkg.terms_and_conditions || '',
          paymentType: pkg.payment_type === 'one-time' ? 'one-time' : 'recurring',
          billingCycle: pkg.billing_cycle === 'monthly' ? 'monthly' : 'yearly',
          advancePaymentMonths: pkg.advance_payment_months || 0,
          dashboardSections: Array.isArray(pkg.dashboard_sections) ? pkg.dashboard_sections : [],
          isActive: pkg.is_active !== false
        };
      });
      
      console.log('✅ Mapped Supabase packages:', mappedPackages);
      console.log(`📊 Total packages: ${mappedPackages.length}`);
      
      return mappedPackages;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  return {
    packages: Array.isArray(packages) ? packages : [],
    isLoading,
    isError,
    error,
    refetch
  };
};

export type { ISubscriptionPackage } from '@/models/SubscriptionPackage';
