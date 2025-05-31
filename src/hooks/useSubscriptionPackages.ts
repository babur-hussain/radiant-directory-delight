
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscriptionPackages = (userRole?: string) => {
  const {
    data: packages = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages', userRole],
    queryFn: async () => {
      console.log("=== Fetching packages from Supabase ===");
      console.log("User role filter:", userRole);
      
      let query = supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true });
      
      // Don't filter by is_active to show all packages including inactive ones
      
      // Only apply role filter if specified and not 'all'
      if (userRole && userRole !== 'all') {
        console.log("Applying role filter for:", userRole);
        query = query.eq('type', userRole);
      } else {
        console.log("Not applying role filter - fetching all packages");
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }
      
      console.log('Raw data from Supabase:', data);
      
      if (!data || data.length === 0) {
        console.log('No packages found in database');
        return [];
      }
      
      // Map the data to our interface
      const mappedPackages = data.map((pkg): ISubscriptionPackage => {
        let features: string[] = [];
        
        // Parse features with better error handling
        if (pkg.features) {
          try {
            if (typeof pkg.features === 'string') {
              // Try to parse as JSON first
              try {
                features = JSON.parse(pkg.features);
              } catch {
                // If JSON parsing fails, split by common delimiters
                features = pkg.features
                  .split(/[✅✔\n,]/)
                  .map((f: string) => f.trim())
                  .filter((f: string) => f.length > 0)
                  .map((f: string) => f.replace(/^[•\-\*]\s*/, ''));
              }
            } else if (Array.isArray(pkg.features)) {
              features = pkg.features;
            }
          } catch (e) {
            console.warn('Error parsing features for package:', pkg.title, e);
            features = ['Package features will be updated soon'];
          }
        } else {
          // Default features if none provided
          features = ['Full access to platform features'];
        }
        
        return {
          id: pkg.id,
          title: pkg.title,
          price: pkg.price || 0,
          monthlyPrice: pkg.monthly_price || pkg.price || 0,
          setupFee: pkg.setup_fee || 0,
          durationMonths: pkg.duration_months || 12,
          shortDescription: pkg.short_description || '',
          fullDescription: pkg.full_description || '',
          features: features,
          popular: pkg.popular || false,
          type: pkg.type?.toLowerCase() === 'influencer' ? 'Influencer' : 'Business',
          termsAndConditions: pkg.terms_and_conditions || '',
          paymentType: pkg.payment_type === 'one-time' ? 'one-time' : 'recurring',
          billingCycle: pkg.billing_cycle === 'monthly' ? 'monthly' : 'yearly',
          advancePaymentMonths: pkg.advance_payment_months || 0,
          dashboardSections: Array.isArray(pkg.dashboard_sections) ? pkg.dashboard_sections : [],
          isActive: pkg.is_active !== false // Default to true if not specified
        };
      });
      
      console.log('Mapped packages:', mappedPackages);
      console.log('Total packages found:', mappedPackages.length);
      
      return mappedPackages;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: true
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
