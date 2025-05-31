
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscriptionPackages = (userRole?: string) => {
  console.log("=== useSubscriptionPackages called ===");
  console.log("userRole parameter:", userRole);

  const {
    data: packages = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages', userRole],
    queryFn: async () => {
      console.log("=== Starting packages fetch ===");
      console.log("Supabase client:", !!supabase);
      
      try {
        // First, let's check what's in the database
        console.log("Checking database connection...");
        
        const { data: rawData, error: fetchError, count } = await supabase
          .from('subscription_packages')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });
        
        console.log("=== Raw database response ===");
        console.log("Error:", fetchError);
        console.log("Count:", count);
        console.log("Raw data:", rawData);
        console.log("Raw data length:", rawData?.length);
        
        if (fetchError) {
          console.error('Database fetch error:', fetchError);
          throw new Error(`Database error: ${fetchError.message}`);
        }
        
        if (!rawData) {
          console.log('No data returned from database');
          return [];
        }
        
        if (rawData.length === 0) {
          console.log('Database returned empty array');
          return [];
        }
        
        console.log("=== Processing packages ===");
        rawData.forEach((pkg, idx) => {
          console.log(`Package ${idx + 1}:`, {
            id: pkg.id,
            title: pkg.title,
            type: pkg.type,
            price: pkg.price,
            isActive: pkg.is_active,
            features: pkg.features
          });
        });
        
        // Map the data to our interface
        const mappedPackages = rawData.map((pkg, index): ISubscriptionPackage => {
          console.log(`=== Mapping package ${index + 1}: ${pkg.title} ===`);
          
          let features: string[] = [];
          
          // Parse features with better error handling
          if (pkg.features) {
            try {
              if (typeof pkg.features === 'string') {
                console.log("Features is string:", pkg.features);
                // Try to parse as JSON first
                try {
                  features = JSON.parse(pkg.features);
                  console.log('Parsed features as JSON:', features);
                } catch {
                  // If JSON parsing fails, split by common delimiters
                  features = pkg.features
                    .split(/[✅✔\n,]/)
                    .map((f: string) => f.trim())
                    .filter((f: string) => f.length > 0)
                    .map((f: string) => f.replace(/^[•\-\*]\s*/, ''));
                  console.log('Parsed features by splitting:', features);
                }
              } else if (Array.isArray(pkg.features)) {
                features = pkg.features;
                console.log('Features already array:', features);
              }
            } catch (e) {
              console.warn('Error parsing features for package:', pkg.title, e);
              features = ['Package features will be updated soon'];
            }
          } else {
            console.log("No features found, using default");
            features = ['Full access to platform features'];
          }
          
          // Ensure type is properly cast to the union type - fix the TypeScript error
          const packageType: 'Business' | 'Influencer' = pkg.type && pkg.type.toLowerCase() === 'influencer' ? 'Influencer' : 'Business';
          console.log("Package type mapping:", pkg.type, "->", packageType);
          
          const mappedPackage: ISubscriptionPackage = {
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
            type: packageType,
            termsAndConditions: pkg.terms_and_conditions || '',
            paymentType: pkg.payment_type === 'one-time' ? 'one-time' : 'recurring',
            billingCycle: pkg.billing_cycle === 'monthly' ? 'monthly' : 'yearly',
            advancePaymentMonths: pkg.advance_payment_months || 0,
            dashboardSections: Array.isArray(pkg.dashboard_sections) ? pkg.dashboard_sections : [],
            isActive: pkg.is_active !== false // Default to true if not specified
          };
          
          console.log('Final mapped package:', mappedPackage);
          return mappedPackage;
        });
        
        console.log("=== Final results ===");
        console.log('Total mapped packages:', mappedPackages.length);
        console.log('All mapped packages:', mappedPackages);
        
        return mappedPackages;
      } catch (error) {
        console.error('Critical error in subscription packages query:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  console.log("=== Hook final state ===");
  console.log("packages:", packages);
  console.log("packages type:", typeof packages);
  console.log("packages is array:", Array.isArray(packages));
  console.log("packages length:", packages?.length);
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("error:", error?.message);

  return {
    packages: Array.isArray(packages) ? packages : [],
    isLoading,
    isError,
    error,
    refetch
  };
};

export type { ISubscriptionPackage } from '@/models/SubscriptionPackage';
