
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2 } from 'lucide-react';
import { RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { toast } from 'sonner';
import { loadPaymentScript } from '@/utils/payment/paymentScriptLoader';

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
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Create a transaction ID at component initialization and reuse it
  const [transactionId] = useState(`txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  useEffect(() => {
    // Load Razorpay script once
    const loadScript = async () => {
      setIsLoading(true);
      const loaded = await loadPaymentScript();
      if (loaded) {
        console.log('Razorpay script loaded successfully');
        setScriptLoaded(true);
      } else {
        console.error('Failed to load Razorpay script');
        toast('Failed to load payment gateway. Please try again later.');
        onFailure(new Error('Failed to load payment gateway. Please try again later.'));
      }
      setIsLoading(false);
    };
    
    if (!window.Razorpay) {
      loadScript();
    } else {
      setScriptLoaded(true);
    }
  }, [onFailure, isRetrying]);

  const handlePayment = () => {
    if (!user) {
      toast('User not authenticated. Please login and try again.');
      onFailure(new Error('User not authenticated'));
      return;
    }

    if (!window.Razorpay) {
      if (retryCount < 3) {
        toast('Payment gateway not loaded. Retrying...');
        setRetryCount(prev => prev + 1);
        setIsRetrying(!isRetrying); // Toggle to trigger useEffect
        return;
      } else {
        toast('Payment gateway could not be loaded. Please refresh and try again.');
        onFailure(new Error('Payment gateway not loaded after multiple attempts'));
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create order ID (in a production app, this would come from your backend)
      const orderId = generateOrderId();
      
      // Calculate total amount including setup fee
      const amount = (selectedPackage.price + (selectedPackage.setupFee || 0)) * 100; // Razorpay expects amount in paise
      console.log(`Processing payment with amount: ${amount/100} rupees (price: ${selectedPackage.price}, setup fee: ${selectedPackage.setupFee || 0})`);

      // Optimize notes to stay under the 15 limit - THIS IS KEY TO FIXING THE ERROR
      // Only include the most critical notes
      const notes: Record<string, string> = {
        package_id: selectedPackage.id,
        user_id: user.id,
        isNonRefundable: "true",
        refundStatus: "no_refund_allowed",
        transaction_id: transactionId,
        refundPolicy: "no_refunds"
      };

      // Only add referral ID if it exists
      if (referralId) {
        notes.referral_id = referralId;
      }

      // Add setup fee only if it exists to save on note count
      if (selectedPackage.setupFee) {
        notes.setup_fee = String(selectedPackage.setupFee);
      }

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
        notes: notes, // OPTIMIZED TO STAY UNDER 15 ITEMS
        transaction_id: transactionId, // Add at top level for stronger tracking
        isNonRefundable: true, // Add at top level for stronger prevention
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
          
          // Add comprehensive flags to prevent refunds in response processing
          response.preventRefunds = true;
          response.isNonRefundable = true;
          response.refundStatus = "no_refund_allowed";
          response.autoRefund = false;
          response.refundsDisabled = true;
          response.refundPolicy = "no_refunds";
          response.nonRefundableTransaction = true;
          response.transaction_id = transactionId;
          response.refundEligible = false;
          response.paymentVerified = true;
          
          // Add setup fee to response for proper handling
          response.setupFee = selectedPackage.setupFee || 0;
          response.totalAmount = selectedPackage.price + (selectedPackage.setupFee || 0);
          
          // Mark payment as verified immediately
          response.paymentConfirmed = new Date().toISOString();
          
          onSuccess(response);
        },
        // For better mobile compatibility
        modal: {
          escape: false,
          backdropclose: false,
          handleback: true,
          confirm_close: true,
          ondismiss: function() {
            toast('Payment cancelled. You can try again.');
            setIsLoading(false);
          }
        },
        // Prevent routing issues
        callback_url: window.location.href,
        redirect: false
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast('Payment failed: ' + (response.error.description || 'Unknown error'));
        onFailure(response.error);
      });
      
      // Add extra error handlers
      razorpayObject.on('payment.error', function(error: any) {
        console.error('Payment error:', error);
        toast('Payment error: ' + (error.message || 'Unknown error'));
        onFailure(error);
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

  const retryPayment = () => {
    setRetryCount(0);
    setIsRetrying(!isRetrying);
  };

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
      
      {retryCount >= 3 && !scriptLoaded && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
          <p className="text-red-700 font-medium">Payment gateway could not be loaded</p>
          <p className="text-red-600 text-sm mt-1">Please try again on a different device or browser</p>
        </div>
      )}
      
      <Button
        onClick={retryCount >= 3 ? retryPayment : handlePayment}
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : retryCount >= 3 ? (
          'Retry Payment'
        ) : (
          'Pay Now'
        )}
      </Button>
      
      {retryCount >= 1 && (
        <p className="text-xs text-muted-foreground mt-2">
          Having trouble? Try refreshing the page or using a different browser.
        </p>
      )}
    </div>
  );
};

export default RazorpayPayment;
