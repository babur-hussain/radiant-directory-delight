
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2 } from 'lucide-react';
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [transactionId] = useState(`TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  useEffect(() => {
    const loadScript = async () => {
      setIsLoading(true);
      const loaded = await loadPaymentScript();
      if (loaded) {
        console.log('Paytm script loaded successfully');
        setScriptLoaded(true);
      } else {
        console.error('Failed to load Paytm script');
        toast('Failed to load payment gateway. Please try again later.');
        onFailure(new Error('Failed to load payment gateway. Please try again later.'));
      }
      setIsLoading(false);
    };
    
    if (!window.Paytm) {
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

    setIsLoading(true);

    try {
      // Create order ID
      const orderId = generateOrderId();
      
      // Calculate total amount including setup fee
      const amount = selectedPackage.price + (selectedPackage.setupFee || 0);
      console.log(`Processing payment with amount: ${amount} rupees (price: ${selectedPackage.price}, setup fee: ${selectedPackage.setupFee || 0})`);

      // Mock payment success for demo (in production, integrate with actual Paytm)
      setTimeout(() => {
        const mockResponse = {
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
          preventRefunds: true,
          isNonRefundable: true,
          refundStatus: "no_refund_allowed",
          autoRefund: false,
          refundsDisabled: true,
          refundPolicy: "no_refunds",
          nonRefundableTransaction: true,
          transaction_id: transactionId,
          refundEligible: false,
          paymentVerified: true,
          setupFee: selectedPackage.setupFee || 0,
          totalAmount: amount,
          paymentConfirmed: new Date().toISOString(),
        };
        
        onSuccess(mockResponse);
        setIsLoading(false);
      }, 3000);

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
          You'll be redirected to the Paytm payment gateway to complete your subscription.
        </p>
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-muted-foreground">
            Initializing Paytm payment gateway...
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
          'Pay with Paytm'
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

export default PaytmPayment;
