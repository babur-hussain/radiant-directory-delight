
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { loadPhonePeScript } from '@/utils/payment/phonePeLoader';

interface PhonePePaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  referralId?: string | null;
}

const PhonePePayment: React.FC<PhonePePaymentProps> = ({
  selectedPackage,
  onSuccess,
  onFailure,
  referralId
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    const loadScript = async () => {
      setIsLoading(true);
      const loaded = await loadPhonePeScript();
      if (loaded) {
        console.log('PhonePe script loaded successfully');
        setScriptLoaded(true);
      } else {
        console.error('Failed to load PhonePe script');
        toast.error('Failed to load payment gateway. Please try again later.');
      }
      setIsLoading(false);
    };
    
    loadScript();
  }, [isRetrying]);

  const handlePayment = async () => {
    if (!user) {
      toast.error('User not authenticated. Please login and try again.');
      onFailure(new Error('User not authenticated'));
      return;
    }

    setIsLoading(true);
    setPaymentInitiated(true);

    try {
      const totalAmount = (selectedPackage.price + (selectedPackage.setupFee || 0)) * 100; // Convert to paise
      console.log(`Processing PhonePe payment with amount: ${totalAmount/100} rupees`);

      // Call the PhonePe integration edge function
      const supabaseUrl = 'https://kyjdfhajtdqhdoijzmgk.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/phonepe-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5amRmaGFqdGRxaGRvaWp6bWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDM0MzYsImV4cCI6MjA1ODA3OTQzNn0.c4zxQzkX6UPpTXB8fQUWU_FV0M0jCbEe1ThzDfUYlYY`
        },
        body: JSON.stringify({
          packageData: selectedPackage,
          customerData: {
            custId: user.uid,
            email: user.email,
            phone: user.phone || '9999999999',
            name: user.name || 'Customer'
          },
          userId: user.uid,
          referralId: referralId,
          enableAutoPay: selectedPackage.paymentType === 'recurring'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize PhonePe payment');
      }

      const paymentConfig = await response.json();
      
      if (paymentConfig.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = paymentConfig.paymentUrl;
      } else {
        throw new Error('Payment URL not received from PhonePe');
      }

    } catch (error) {
      console.error('Error initializing PhonePe payment:', error);
      toast.error('Error initializing payment. Please try again.');
      setIsLoading(false);
      setPaymentInitiated(false);
      onFailure(error);
    }
  };

  const retryPayment = () => {
    setRetryCount(0);
    setIsRetrying(!isRetrying);
    setPaymentInitiated(false);
  };

  return (
    <div className="text-center">
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-blue-700 font-medium">
          Complete your payment to activate your subscription
        </p>
        <p className="text-blue-600 text-sm mt-1">
          Total amount: ₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
        </p>
      </div>
      
      {!scriptLoaded && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <p className="text-orange-700 font-medium">Loading Payment Gateway</p>
          </div>
          <p className="text-orange-600 text-xs">
            Please wait while we prepare the PhonePe payment interface...
          </p>
        </div>
      )}
      
      {isLoading && paymentInitiated && (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to PhonePe...
          </p>
        </div>
      )}
      
      <Button
        onClick={handlePayment}
        className="w-full mt-4"
        disabled={isLoading || !scriptLoaded}
      >
        {isLoading && paymentInitiated ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with PhonePe ₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground mt-2">
        Secure payments powered by PhonePe
      </p>
    </div>
  );
};

export default PhonePePayment;
