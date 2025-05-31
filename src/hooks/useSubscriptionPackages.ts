
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from '@/hooks/use-toast';

export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  
  // Simple query to fetch all packages
  const {
    data: packages = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: async () => {
      console.log("Fetching packages from Supabase...");
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }
      
      console.log('Raw data from Supabase:', data);
      
      if (!data || data.length === 0) {
        console.log('No packages found');
        return [];
      }
      
      // Map the data to our interface
      const mappedPackages = data.map((pkg): ISubscriptionPackage => {
        let features: string[] = [];
        
        // Parse features
        if (pkg.features) {
          try {
            if (typeof pkg.features === 'string') {
              features = JSON.parse(pkg.features);
            } else if (Array.isArray(pkg.features)) {
              features = pkg.features;
            }
          } catch (e) {
            console.warn('Error parsing features:', e);
            features = [];
          }
        }
        
        return {
          id: pkg.id,
          title: pkg.title,
          price: pkg.price,
          monthlyPrice: pkg.monthly_price || undefined,
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
      
      console.log('Mapped packages:', mappedPackages);
      return mappedPackages;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  // Create or update mutation
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      const { data, error } = await supabase
        .from('subscription_packages')
        .upsert({
          id: packageData.id,
          title: packageData.title,
          price: packageData.price,
          monthly_price: packageData.monthlyPrice,
          setup_fee: packageData.setupFee || 0,
          duration_months: packageData.durationMonths || 12,
          short_description: packageData.shortDescription || '',
          full_description: packageData.fullDescription || '',
          features: JSON.stringify(packageData.features || []),
          popular: packageData.popular || false,
          type: packageData.type,
          terms_and_conditions: packageData.termsAndConditions || '',
          payment_type: packageData.paymentType,
          billing_cycle: packageData.billingCycle,
          advance_payment_months: packageData.advancePaymentMonths || 0,
          dashboard_sections: packageData.dashboardSections || []
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to save package: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: (savedPackage) => {
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" saved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save package: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', packageId);
      
      if (error) {
        throw new Error(`Failed to delete package: ${error.message}`);
      }
      
      return packageId;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete package: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    return await createOrUpdateMutation.mutateAsync(packageData);
  };
  
  const remove = async (packageId: string) => {
    await deleteMutation.mutateAsync(packageId);
    return true;
  };

  return {
    packages: Array.isArray(packages) ? packages : [],
    isLoading,
    isError,
    error,
    refetch,
    createOrUpdate,
    remove,
    isCreating: createOrUpdateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

export type { ISubscriptionPackage } from '@/models/SubscriptionPackage';
