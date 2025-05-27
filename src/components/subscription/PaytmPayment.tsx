
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { generateOrderId } from '@/utils/id-generator';
import { Loader2, AlertCircle, CreditCard } from 'lucide-react';
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
  const [paymentInitiated, setPaymentInitiated] = useState(false);

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
    setPaymentInitiated(true);

    try {
      // Calculate total amount including setup fee
      const amount = selectedPackage.price + (selectedPackage.setupFee || 0);
      console.log(`Processing payment with amount: ${amount} rupees`);

      // Call the Paytm integration edge function to get payment details
      const response = await fetch('/functions/v1/paytm-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error('Failed to initialize payment');
      }

      const paymentData = await response.json();
      console.log('Payment data received:', paymentData);

      // Check if Paytm is loaded
      if (!window.Paytm || !window.Paytm.CheckoutJS) {
        throw new Error('Paytm payment gateway not loaded');
      }

      // Configure Paytm payment
      const config = {
        "root": "",
        "flow": "DEFAULT",
        "data": {
          "orderId": paymentData.orderId,
          "token": paymentData.txnToken,
          "tokenType": "TXN_TOKEN",
          "amount": paymentData.amount.toString()
        },
        "handler": {
          "notifyMerchant": function(eventName: string, data: any) {
            console.log("Paytm event:", eventName, data);
            
            if (eventName === 'APP_CLOSED') {
              setPaymentError('Payment was cancelled.');
              onFailure({ message: 'Payment cancelled by user' });
              setIsLoading(false);
              setPaymentInitiated(false);
            }
          }
        }
      };

      // Initialize Paytm payment
      if (window.Paytm.CheckoutJS.init) {
        window.Paytm.CheckoutJS.init(config).then(function() {
          console.log('Paytm CheckoutJS initialized');
          
          // Invoke payment
          window.Paytm.CheckoutJS.invoke().then(function(response: any) {
            console.log('Payment response:', response);
            
            if (response && response.STATUS === 'TXN_SUCCESS') {
              // Payment successful
              const successResponse = {
                ...response,
                package: selectedPackage,
                referralId: referralId,
                setupFee: selectedPackage.setupFee || 0,
                totalAmount: amount,
                paymentConfirmed: new Date().toISOString(),
                paymentVerified: true,
              };
              
              toast.success('Payment completed successfully!');
              onSuccess(successResponse);
            } else {
              // Payment failed
              const errorMessage = response?.RESPMSG || 'Payment failed';
              setPaymentError(errorMessage);
              onFailure(response || { message: 'Payment failed' });
            }
          }).catch(function(error: any) {
            console.error('Payment invoke error:', error);
            setPaymentError('Payment processing failed. Please try again.');
            onFailure(error);
          });
        }).catch(function(error: any) {
          console.error('Paytm init error:', error);
          setPaymentError('Failed to initialize payment gateway.');
          onFailure(error);
        });
      } else {
        throw new Error('Paytm CheckoutJS not properly loaded');
      }

    } catch (error) {
      console.error('Error initializing payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      setPaymentError(errorMessage);
      onFailure(error);
    } finally {
      setIsLoading(false);
      setPaymentInitiated(false);
    }
  };

  const retryPayment = () => {
    setRetryCount(prev => prev + 1);
    setPaymentError(null);
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
      
      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Payment Error</p>
          </div>
          <p className="text-red-600 text-sm">{paymentError}</p>
        </div>
      )}
      
      {isLoading && paymentInitiated && (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-muted-foreground">
            Processing payment...
          </p>
        </div>
      )}
      
      <Button
        onClick={paymentError ? retryPayment : initiatePayment}
        className="w-full mt-4"
        disabled={isLoading || !scriptLoaded}
        variant={paymentError ? "outline" : "default"}
      >
        {isLoading && paymentInitiated ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentError ? (
          'Try Again'
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
          </>
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
