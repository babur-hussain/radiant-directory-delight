
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2 } from 'lucide-react';
import { RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  referralId?: string | null;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  selectedPackage,
  onSuccess,
  onFailure,
  referralId
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script once
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded');
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        toast('Failed to load payment gateway. Please try again later.');
        onFailure(new Error('Failed to load payment gateway. Please try again later.'));
      };
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [onFailure]);

  const handlePayment = () => {
    if (!user) {
      toast('User not authenticated. Please login and try again.');
      onFailure(new Error('User not authenticated'));
      return;
    }

    if (!window.Razorpay) {
      toast('Payment gateway not loaded. Please refresh and try again.');
      onFailure(new Error('Payment gateway not loaded'));
      return;
    }

    setIsLoading(true);

    try {
      // Create order ID (in a production app, this would come from your backend)
      const orderId = generateOrderId();
      const amount = selectedPackage.price * 100; // Razorpay expects amount in paise

      const options = {
        key: RAZORPAY_KEY_ID, // Use the imported live key
        amount: amount,
        currency: 'INR',
        name: 'Grow Bharat Vyapaar',
        description: `Subscription: ${selectedPackage.title}`,
        image: '/lovable-uploads/99199ab2-5520-497e-a73d-9e95ac7e3c89.png',
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        notes: {
          package_id: selectedPackage.id,
          user_id: user.id,
          package_name: selectedPackage.title,
          referral_id: referralId || 'none',
          // Critical flags to prevent auto refunds
          autoRefund: "false",
          isRefundable: "false",
          isNonRefundable: "true",
          refundStatus: "no_refund_allowed",
          isOneTime: (selectedPackage.paymentType === 'one-time').toString(),
          isCancellable: "false"
        },
        theme: {
          color: '#3B82F6'
        },
        handler: function (response: any) {
          // Add the package info to the response for convenience
          response.package = selectedPackage;
          
          // Process referral if applicable
          if (referralId) {
            response.referralId = referralId;
          }
          
          // Add flag to prevent refunds in response processing
          response.preventRefunds = true;
          
          onSuccess(response);
        },
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast('Payment failed: ' + response.error.description);
        onFailure(response.error);
      });
      razorpayObject.open();
      setIsLoading(false);

    } catch (error) {
      console.error('Error initializing payment:', error);
      toast('Error initializing payment. Please try again.');
      setIsLoading(false);
      onFailure(error);
    }
  };

  useEffect(() => {
    if (scriptLoaded && !isLoading) {
      handlePayment();
    }
  }, [scriptLoaded]);

  return (
    <div className="text-center">
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-blue-700">
          You'll be redirected to the payment gateway to complete your subscription.
        </p>
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-muted-foreground">
            Initializing payment gateway...
          </p>
        </div>
      )}
      
      <Button
        onClick={handlePayment}
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </div>
  );
};

export default RazorpayPayment;
