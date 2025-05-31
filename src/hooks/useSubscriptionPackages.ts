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
      console.log("Fetching subscription packages...");
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) {
        console.error('Database fetch error:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.log('No packages found in database');
        return [];
      }
      
      console.log('Raw packages from database:', data);
      
      // Simple mapping without complex parsing
      const mappedPackages: ISubscriptionPackage[] = data.map((pkg): ISubscriptionPackage => {
        // Parse features - keep it simple
        let features: string[] = [];
        if (pkg.features) {
          if (typeof pkg.features === 'string') {
            try {
              features = JSON.parse(pkg.features);
            } catch {
              // If JSON parsing fails, split by common delimiters
              features = pkg.features.split(/[\n,]/).map(f => f.trim()).filter(f => f.length > 0);
            }
          } else if (Array.isArray(pkg.features)) {
            features = pkg.features;
          }
        }
        
        if (features.length === 0) {
          features = ['Full platform access'];
        }
        
        return {
          id: pkg.id,
          title: pkg.title || 'Subscription Package',
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
      
      console.log('Final mapped packages:', mappedPackages);
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
