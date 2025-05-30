
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { loadPhonePeScript, isPhonePeAvailable } from '@/utils/payment/phonePeLoader';

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

      // Call the PhonePe integration edge function
      const supabaseUrl = 'https://kyjdfhajtdqhdoijzmgk.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/phonepe-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5amRmaGFqdGRxaGRvaWp6bWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDM0MzYsImV4cCI6MjA1ODA3OTQzNn0.c4zxQzkX6UPpTXB8fQUWU_FV0M0jCbEe1ThzDfUYlYY`
        },
        body: JSON.stringify({
          packageData,
          customerData: {
            custId: user.uid,
            email: user.email,
            phone: user.phone || '9999999999',
            name: user.name || 'Customer'
          },
          userId: user.uid,
          enableAutoPay: packageData.paymentType === 'recurring'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize PhonePe payment');
      }

      const paymentConfig = await response.json();
      
      return new Promise((resolve, reject) => {
        try {
          // Redirect to PhonePe payment URL
          if (paymentConfig.paymentUrl) {
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
