
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

// Your specific packages from the screenshot
const getHardcodedPackages = (): ISubscriptionPackage[] => [
  {
    id: 'business-basic',
    title: 'Basic',
    price: 299,
    monthlyPrice: 299,
    setupFee: 0,
    durationMonths: 1,
    shortDescription: '200 KM radius visibility',
    fullDescription: 'Basic package for small businesses',
    features: [
      'Free profile creation',
      '6 video categories',
      'Local business connections',
      '200 KM radius visibility',
      'Basic support'
    ],
    popular: false,
    type: 'Business',
    termsAndConditions: '',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    advancePaymentMonths: 0,
    dashboardSections: [],
    isActive: true
  },
  {
    id: 'business-pro',
    title: 'Pro',
    price: 499,
    monthlyPrice: 499,
    setupFee: 0,
    durationMonths: 1,
    shortDescription: '450 KM radius visibility',
    fullDescription: 'Pro package for growing businesses',
    features: [
      'All Basic features',
      '450 KM radius visibility',
      'Higher exposure',
      'More business connections',
      'Priority support',
      'Analytics dashboard'
    ],
    popular: true,
    type: 'Business',
    termsAndConditions: '',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    advancePaymentMonths: 0,
    dashboardSections: [],
    isActive: true
  },
  {
    id: 'business-premium',
    title: 'Premium',
    price: 799,
    monthlyPrice: 799,
    setupFee: 0,
    durationMonths: 1,
    shortDescription: '1050 KM radius visibility',
    fullDescription: 'Premium package for enterprise businesses',
    features: [
      'All Pro features',
      '1050 KM radius visibility',
      'Premium placement',
      'Maximum earning potential',
      'Dedicated account manager',
      'Advanced analytics'
    ],
    popular: false,
    type: 'Business',
    termsAndConditions: '',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    advancePaymentMonths: 0,
    dashboardSections: [],
    isActive: true
  }
];

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
      
      // Get hardcoded packages
      const hardcodedPackages = getHardcodedPackages();
      console.log("📦 Hardcoded packages:", hardcodedPackages);
      
      // Try to get packages from Supabase
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        console.log('📦 Returning only hardcoded packages due to error');
        return hardcodedPackages;
      }
      
      console.log('✅ Raw data from Supabase:', data);
      
      let supabasePackages: ISubscriptionPackage[] = [];
      
      if (data && data.length > 0) {
        // Map Supabase data to our interface
        supabasePackages = data.map((pkg): ISubscriptionPackage => {
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
        
        console.log('✅ Mapped Supabase packages:', supabasePackages);
      }
      
      // Combine hardcoded packages with Supabase packages
      // Filter out duplicates by ID
      const allPackages = [...hardcodedPackages];
      
      // Add Supabase packages that don't already exist in hardcoded packages
      supabasePackages.forEach(supabasePackage => {
        const exists = hardcodedPackages.some(hardcodedPackage => 
          hardcodedPackage.id === supabasePackage.id
        );
        if (!exists) {
          allPackages.push(supabasePackage);
        }
      });
      
      // Sort by price
      allPackages.sort((a, b) => a.price - b.price);
      
      console.log('✅ Final combined packages:', allPackages);
      console.log(`📊 Total packages: ${allPackages.length} (${hardcodedPackages.length} hardcoded + ${supabasePackages.length} from Supabase)`);
      
      return allPackages;
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
