
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [paymentInitiated, setPaymentInitiated] = useState(false);

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
      
      if (paymentConfig.success && paymentConfig.paymentUrl) {
        // Store payment details and redirect to PhonePe
        sessionStorage.setItem('phonepe_payment_details', JSON.stringify({
          merchantTransactionId: paymentConfig.merchantTransactionId,
          amount: paymentConfig.amount,
          packageId: selectedPackage.id
        }));
        
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
        disabled={isLoading}
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
