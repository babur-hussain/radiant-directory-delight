import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { supabase } from '@/integrations/supabase/client';

export const useInstamojoPayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (packageData: ISubscriptionPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to continue with payment",
        variant: "destructive"
      });
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the Instamojo integration edge function using Supabase client
      const { data: paymentConfig, error: paymentError } = await supabase.functions.invoke('instamojo-integration', {
        body: {
          packageData,
          customerData: {
            custId: user.uid,
            email: user.email,
            phone: user.phone || '9999999999',
            name: user.name || 'Customer'
          },
          userId: user.uid
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Failed to initialize Instamojo payment');
      }

      if (!paymentConfig) {
        throw new Error('No payment configuration received');
      }

      // Redirect to Instamojo payment URL
      if (paymentConfig.paymentUrl) {
        window.location.href = paymentConfig.paymentUrl;
      } else {
        throw new Error('Payment URL not received from Instamojo');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    initiatePayment
  };
}; 