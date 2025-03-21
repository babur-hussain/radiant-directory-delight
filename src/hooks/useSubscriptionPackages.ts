
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  durationMonths: number;
  shortDescription?: string;
  fullDescription?: string;
  features: string[];
  type: 'Business' | 'Influencer';
  paymentType: 'recurring' | 'one-time';
  setupFee?: number;
  monthlyPrice?: number;
  billingCycle?: 'monthly' | 'yearly';
  advancePaymentMonths?: number;
  popular?: boolean;
  isActive?: boolean;
  dashboardSections?: string[];
}

const formatPackageFromSupabase = (pkg: any): ISubscriptionPackage => {
  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    durationMonths: pkg.duration_months,
    shortDescription: pkg.short_description,
    fullDescription: pkg.full_description,
    features: Array.isArray(pkg.features) ? pkg.features : [],
    type: pkg.type,
    paymentType: pkg.payment_type || 'recurring',
    setupFee: pkg.setup_fee,
    monthlyPrice: pkg.monthly_price,
    billingCycle: pkg.billing_cycle || 'yearly',
    advancePaymentMonths: pkg.advance_payment_months,
    popular: pkg.popular,
    isActive: pkg.is_active,
    dashboardSections: pkg.dashboard_sections
  };
};

const formatPackageForSupabase = (pkg: ISubscriptionPackage) => {
  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    duration_months: pkg.durationMonths,
    short_description: pkg.shortDescription,
    full_description: pkg.fullDescription,
    features: pkg.features,
    type: pkg.type,
    payment_type: pkg.paymentType,
    setup_fee: pkg.setupFee,
    monthly_price: pkg.monthlyPrice,
    billing_cycle: pkg.billingCycle,
    advance_payment_months: pkg.advancePaymentMonths,
    popular: pkg.popular,
    is_active: pkg.isActive,
    dashboard_sections: pkg.dashboardSections
  };
};

export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  const [packageType, setPackageType] = useState<string | null>(null);
  
  // Get all subscription packages
  const { 
    data: packages = [], 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages', packageType],
    queryFn: async () => {
      let query = supabase
        .from('subscription_packages')
        .select('*')
        .order('price', { ascending: true });
      
      if (packageType) {
        query = query.eq('type', packageType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching subscription packages:", error);
        throw error;
      }
      
      return (data || []).map(formatPackageFromSupabase);
    }
  });
  
  // Fetch packages by type
  const fetchPackagesByType = async (type: string) => {
    setPackageType(type);
    await refetch();
    return packages.filter(pkg => pkg.type === type);
  };
  
  // Create or update a subscription package
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      const formattedData = formatPackageForSupabase(packageData);
      
      const { data, error } = await supabase
        .from('subscription_packages')
        .upsert(formattedData)
        .select();
      
      if (error) {
        console.error("Error saving subscription package:", error);
        throw error;
      }
      
      return data ? formatPackageFromSupabase(data[0]) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
      toast({
        title: 'Success',
        description: 'Subscription package saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save subscription package: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  });
  
  // Remove a subscription package
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting subscription package:", error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
      toast({
        title: 'Success',
        description: 'Subscription package deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete subscription package: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  });
  
  // Update package sections
  const updatePackageSectionsMutation = useMutation({
    mutationFn: async ({ packageId, sections }: { packageId: string, sections: string[] }) => {
      const { data, error } = await supabase
        .from('subscription_packages')
        .update({ dashboard_sections: sections })
        .eq('id', packageId)
        .select();
      
      if (error) {
        console.error("Error updating package sections:", error);
        throw error;
      }
      
      return data ? formatPackageFromSupabase(data[0]) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
      toast({
        title: 'Success',
        description: 'Package sections updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update package sections: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  });
  
  // Check server status
  const { data: serverStatus = false } = useQuery({
    queryKey: ['subscription-server-status'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('id')
          .limit(1);
        
        return !error;
      } catch (error) {
        console.error("Error checking server status:", error);
        return false;
      }
    }
  });
  
  return {
    packages,
    isLoading,
    isError,
    error: error as Error,
    refetch,
    createOrUpdate: createOrUpdateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    updatePackageSections: updatePackageSectionsMutation.mutateAsync,
    isCreating: createOrUpdateMutation.isPending,
    isDeleting: removeMutation.isPending,
    fetchPackagesByType,
    serverStatus
  };
};
