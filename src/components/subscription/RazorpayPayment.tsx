
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
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
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId] = useState(`txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  useEffect(() => {
    const loadScript = async () => {
      setIsLoading(true);
      const loaded = await loadPaymentScript();
      if (loaded) {
        console.log('Razorpay script loaded successfully');
        setScriptLoaded(true);
      } else {
        console.error('Failed to load Razorpay script');
        toast.error('Failed to load payment gateway. Please try again later.');
      }
      setIsLoading(false);
    };
    
    if (!window.Razorpay && !scriptLoaded) {
      loadScript();
    } else if (window.Razorpay) {
      setScriptLoaded(true);
    }
  }, [isRetrying]);

  const handlePayment = () => {
    if (!user) {
      toast.error('User not authenticated. Please login and try again.');
      onFailure(new Error('User not authenticated'));
      return;
    }

    if (!window.Razorpay) {
      if (retryCount < 3) {
        toast.error('Payment gateway not loaded. Retrying...');
        setRetryCount(prev => prev + 1);
        setIsRetrying(!isRetrying);
        return;
      } else {
        toast.error('Payment gateway could not be loaded. Please refresh and try again.');
        onFailure(new Error('Payment gateway not loaded after multiple attempts'));
        return;
      }
    }

    setIsLoading(true);
    setPaymentInitiated(true);

    try {
      const orderId = generateOrderId();
      const amount = (selectedPackage.price + (selectedPackage.setupFee || 0)) * 100;
      console.log(`Processing payment with amount: ${amount/100} rupees (price: ${selectedPackage.price}, setup fee: ${selectedPackage.setupFee || 0})`);

      const notes: Record<string, string> = {
        package_id: selectedPackage.id,
        user_id: user.id,
        isNonRefundable: "true",
        refundStatus: "no_refund_allowed",
        transaction_id: transactionId,
        refundPolicy: "no_refunds"
      };

      if (referralId) {
        notes.referral_id = referralId;
      }

      if (selectedPackage.setupFee) {
        notes.setup_fee = String(selectedPackage.setupFee);
      }

      const options = {
        key: RAZORPAY_KEY_ID,
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
        notes: notes,
        transaction_id: transactionId,
        isNonRefundable: true,
        theme: {
          color: '#3B82F6'
        },
        handler: function (response: any) {
          response.package = selectedPackage;
          
          if (referralId) {
            response.referralId = referralId;
          }
          
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
          response.setupFee = selectedPackage.setupFee || 0;
          response.totalAmount = selectedPackage.price + (selectedPackage.setupFee || 0);
          response.paymentConfirmed = new Date().toISOString();
          
          onSuccess(response);
        },
        modal: {
          escape: false,
          backdropclose: false,
          handleback: true,
          confirm_close: true,
          ondismiss: function() {
            toast.error('Payment cancelled. You can try again.');
            setIsLoading(false);
            setPaymentInitiated(false);
          }
        },
        callback_url: window.location.href,
        redirect: false
      };

      const razorpayObject = new window.Razorpay(options);
      
      razorpayObject.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed: ' + (response.error.description || 'Unknown error'));
        setIsLoading(false);
        setPaymentInitiated(false);
        onFailure(response.error);
      });
      
      razorpayObject.on('payment.error', function(error: any) {
        console.error('Payment error:', error);
        toast.error('Payment error: ' + (error.message || 'Unknown error'));
        setIsLoading(false);
        setPaymentInitiated(false);
        onFailure(error);
      });
      
      razorpayObject.open();
      setIsLoading(false);

    } catch (error) {
      console.error('Error initializing payment:', error);
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
            Please wait while we prepare the payment interface...
          </p>
        </div>
      )}
      
      {isLoading && paymentInitiated && (
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
        disabled={isLoading || !scriptLoaded}
      >
        {isLoading && paymentInitiated ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : retryCount >= 3 ? (
          'Retry Payment'
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
          </>
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
