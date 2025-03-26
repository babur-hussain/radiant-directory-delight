
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  shortDescription: string;
  fullDescription?: string;
  features: string[];
  setupFee?: number;
  popular?: boolean;
  type: 'Business' | 'Influencer';
  durationMonths?: number;
  advancePaymentMonths?: number;
  paymentType?: 'recurring' | 'one-time';
  billingCycle?: 'monthly' | 'yearly';
  termsAndConditions?: string;
  dashboardSections?: string[];
  isActive?: boolean;
}

export const useSubscriptionPackages = () => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      // Fetch packages from Supabase
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Process the data to ensure it matches our type
      const processedData = data.map(pkg => {
        // Parse features array if it's a string
        let featuresArray: string[] = [];
        if (typeof pkg.features === 'string') {
          try {
            featuresArray = JSON.parse(pkg.features);
          } catch (e) {
            console.warn('Error parsing features JSON:', e);
            featuresArray = [];
          }
        } else if (Array.isArray(pkg.features)) {
          featuresArray = pkg.features;
        }
        
        // Parse dashboard sections array if needed
        let dashboardSectionsArray: string[] = [];
        if (typeof pkg.dashboard_sections === 'string') {
          try {
            dashboardSectionsArray = JSON.parse(pkg.dashboard_sections);
          } catch (e) {
            console.warn('Error parsing dashboard sections JSON:', e);
            dashboardSectionsArray = [];
          }
        } else if (Array.isArray(pkg.dashboard_sections)) {
          dashboardSectionsArray = pkg.dashboard_sections;
        }
        
        return {
          id: pkg.id,
          title: pkg.title,
          price: pkg.price,
          monthlyPrice: pkg.monthly_price || 0,
          shortDescription: pkg.short_description || '',
          fullDescription: pkg.full_description || '',
          features: featuresArray,
          setupFee: pkg.setup_fee || 0,
          popular: pkg.popular || false,
          type: (pkg.type || 'Business') as 'Business' | 'Influencer',
          durationMonths: pkg.duration_months || 12,
          advancePaymentMonths: pkg.advance_payment_months || 0,
          paymentType: (pkg.payment_type || 'recurring') as 'recurring' | 'one-time',
          billingCycle: pkg.billing_cycle as ('monthly' | 'yearly') | undefined,
          termsAndConditions: pkg.terms_and_conditions || '',
          dashboardSections: dashboardSectionsArray,
          isActive: true // Default value since we don't have this field in the database yet
        } as ISubscriptionPackage;
      });
      
      setPackages(processedData);
      setIsError(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription packages:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to refetch packages
  const refetch = async () => {
    await fetchPackages();
  };
  
  // Function to create or update a package
  const createOrUpdate = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
    setIsCreating(true);
    try {
      // Convert the frontend model to the database model
      const dbPackage = {
        id: packageData.id,
        title: packageData.title,
        price: packageData.price,
        monthly_price: packageData.monthlyPrice,
        short_description: packageData.shortDescription,
        full_description: packageData.fullDescription,
        features: Array.isArray(packageData.features) ? JSON.stringify(packageData.features) : packageData.features,
        setup_fee: packageData.setupFee,
        popular: packageData.popular,
        type: packageData.type,
        duration_months: packageData.durationMonths,
        advance_payment_months: packageData.advancePaymentMonths,
        payment_type: packageData.paymentType,
        billing_cycle: packageData.billingCycle,
        terms_and_conditions: packageData.termsAndConditions,
        dashboard_sections: packageData.dashboardSections
      };
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .upsert(dbPackage)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refetch packages to update the list
      await fetchPackages();
      
      return packageData;
    } catch (err) {
      console.error('Error creating/updating subscription package:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Function to delete a package
  const remove = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refetch packages to update the list
      await fetchPackages();
    } catch (err) {
      console.error('Error deleting subscription package:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    fetchPackages();
  }, []);
  
  return {
    packages,
    isLoading,
    isError,
    error,
    refetch,
    createOrUpdate,
    remove,
    isCreating
  };
};

export default useSubscriptionPackages;
