
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscriptionPackages = () => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        // Fetch packages from Supabase
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('isActive', true)
          .order('price', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Process the data to ensure it matches our type
        const processedData = data.map(pkg => ({
          id: pkg.id,
          title: pkg.title,
          price: pkg.price,
          monthlyPrice: pkg.monthlyPrice,
          shortDescription: pkg.shortDescription,
          fullDescription: pkg.fullDescription,
          features: Array.isArray(pkg.features) ? pkg.features : [],
          setupFee: pkg.setupFee || 0,
          popular: pkg.popular || false,
          type: pkg.type as 'Business' | 'Influencer',
          durationMonths: pkg.durationMonths || 12,
          advancePaymentMonths: pkg.advancePaymentMonths || 0,
          paymentType: pkg.paymentType as 'recurring' | 'one-time',
          billingCycle: pkg.billingCycle,
          termsAndConditions: pkg.termsAndConditions,
          dashboardSections: Array.isArray(pkg.dashboardSections) ? pkg.dashboardSections : [],
          isActive: pkg.isActive
        }));
        
        setPackages(processedData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching subscription packages:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
  return {
    packages,
    isLoading,
    isError
  };
};

export default useSubscriptionPackages;
