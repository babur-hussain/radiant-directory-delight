import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { loadPhonePeScript } from '@/utils/payment/phonePeLoader';
import { supabase } from '@/integrations/supabase/client';

export const usePhonePePayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phonePeInstanceRef = useRef<any>(null);
  
  useEffect(() => {
    return () => {
      if (phonePeInstanceRef.current) {
        try {
          phonePeInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up PhonePe instance:', err);
        }
      }
    };
  }, []);
  
  const initiatePayment = async (packageData: ISubscriptionPackage, enableAutoPay = true) => {
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
      
      const isLoaded = await loadPhonePeScript();
      if (!isLoaded) {
        throw new Error('Failed to load PhonePe payment gateway');
      }
      
      const totalAmount = (packageData.price || 0) + (packageData.setupFee || 0);
      console.log(`Processing PhonePe payment with amount: ${totalAmount} rupees`);

      // Call the PhonePe integration edge function using Supabase client
      const { data: paymentConfig, error: paymentError } = await supabase.functions.invoke('phonepe-integration', {
        body: {
          packageData,
          customerData: {
            custId: user.uid,
            email: user.email,
            phone: user.phone || '9999999999',
            name: user.name || 'Customer'
          },
          userId: user.uid,
          enableAutoPay: packageData.paymentType === 'recurring'
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Failed to initialize PhonePe payment');
      }

      if (!paymentConfig) {
        throw new Error('No payment configuration received');
      }
      
      return new Promise((resolve, reject) => {
        try {
          // Redirect to PhonePe payment URL
          if (paymentConfig.paymentUrl) {
            console.log('Redirecting to PhonePe payment URL:', paymentConfig.paymentUrl);
            window.location.href = paymentConfig.paymentUrl;
          } else {
            throw new Error('Payment URL not received from PhonePe');
          }
          
          phonePeInstanceRef.current = { 
            merchantTransactionId: paymentConfig.merchantTransactionId, 
            amount: totalAmount 
          };
          
        } catch (err) {
          console.error('PhonePe payment initialization error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize PhonePe payment gateway';
          toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive"
          });
          reject(err);
        }
      });
      
    } catch (error) {
      console.error('Error initiating PhonePe payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
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
