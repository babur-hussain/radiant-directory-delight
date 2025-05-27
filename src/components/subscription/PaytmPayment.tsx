
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2, AlertCircle } from 'lucide-react';
import { getPaymentGatewayKey } from '@/utils/payment/paymentScriptLoader';
import { toast } from 'sonner';
import { loadPaymentScript } from '@/utils/payment/paymentScriptLoader';

declare global {
  interface Window {
    Paytm: any;
  }
}

interface PaytmPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  referralId?: string | null;
}

const PaytmPayment: React.FC<PaytmPaymentProps> = ({
  selectedPackage,
  onSuccess,
  onFailure,
  referralId
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [transactionId] = useState(`TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  useEffect(() => {
    const loadScript = async () => {
      setIsLoading(true);
      setPaymentError(null);
      
      const loaded = await loadPaymentScript();
      if (loaded) {
        console.log('Paytm script loaded successfully');
        setScriptLoaded(true);
      } else {
        console.error('Failed to load Paytm script');
        setPaymentError('Failed to load payment gateway. Please check your internet connection.');
      }
      setIsLoading(false);
    };
    
    if (!window.Paytm && !scriptLoaded) {
      loadScript();
    } else if (window.Paytm) {
      setScriptLoaded(true);
    }
  }, [retryCount]);

  const initiatePayment = async () => {
    if (!user) {
      setPaymentError('Please login to continue with payment');
      onFailure(new Error('User not authenticated'));
      return;
    }

    if (!scriptLoaded) {
      setPaymentError('Payment gateway not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Create order ID
      const orderId = generateOrderId();
      
      // Calculate total amount including setup fee
      const amount = selectedPackage.price + (selectedPackage.setupFee || 0);
      console.log(`Processing payment with amount: ${amount} rupees`);

      // Call backend to get payment token (this would be your actual payment integration)
      const paymentData = {
        orderId,
        amount,
        customerInfo: {
          custId: user.uid,
          email: user.email,
          phone: user.phone || '9999999999'
        },
        packageInfo: {
          packageId: selectedPackage.id,
          packageName: selectedPackage.title
        }
      };

      console.log('Initiating payment with data:', paymentData);

      // For now, simulate payment processing with a delay
      // In production, you would call your backend API here
      setTimeout(() => {
        // Simulate random payment success/failure for demo
        const isSuccess = Math.random() > 0.3; // 70% success rate for demo
        
        if (isSuccess) {
          const successResponse = {
            TXNID: transactionId,
            ORDERID: orderId,
            TXNAMOUNT: amount.toString(),
            STATUS: 'TXN_SUCCESS',
            RESPCODE: '01',
            RESPMSG: 'Transaction Successful',
            PAYMENTMODE: 'WALLET',
            BANKNAME: 'PAYTM',
            MID: getPaymentGatewayKey(),
            package: selectedPackage,
            referralId: referralId,
            transaction_id: transactionId,
            setupFee: selectedPackage.setupFee || 0,
            totalAmount: amount,
            paymentConfirmed: new Date().toISOString(),
            paymentVerified: true,
          };
          
          toast.success('Payment completed successfully!');
          onSuccess(successResponse);
        } else {
          const errorResponse = {
            STATUS: 'TXN_FAILURE',
            RESPCODE: '227',
            RESPMSG: 'Payment failed. Please try again.',
            ORDERID: orderId
          };
          
          setPaymentError('Payment failed. Please try again with a different payment method.');
          onFailure(errorResponse);
        }
        
        setIsLoading(false);
      }, 3000); // 3 second delay to simulate payment processing

    } catch (error) {
      console.error('Error initializing payment:', error);
      setPaymentError('Payment initialization failed. Please try again.');
      setIsLoading(false);
      onFailure(error);
    }
  };

  const retryPayment = () => {
    setRetryCount(prev => prev + 1);
    setPaymentError(null);
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
      
      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Payment Error</p>
          </div>
          <p className="text-red-600 text-sm">{paymentError}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-muted-foreground">
            {scriptLoaded ? 'Processing payment...' : 'Loading payment gateway...'}
          </p>
        </div>
      )}
      
      <Button
        onClick={paymentError ? retryPayment : initiatePayment}
        className="w-full mt-4"
        disabled={isLoading || !scriptLoaded}
        variant={paymentError ? "outline" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {scriptLoaded ? 'Processing...' : 'Loading...'}
          </>
        ) : paymentError ? (
          'Try Again'
        ) : (
          `Pay ₹${(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}`
        )}
      </Button>
      
      {!scriptLoaded && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          Having trouble? Try refreshing the page or check your internet connection.
        </p>
      )}
    </div>
  );
};

export default PaytmPayment;
