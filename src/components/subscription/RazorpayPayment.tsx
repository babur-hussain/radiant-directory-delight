
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Shield, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay } from '@/hooks/useRazorpay';
import { ensureRazorpayAvailable } from '@/utils/razorpayLoader';
import PaymentErrorFallback from './PaymentErrorFallback';

interface RazorpayPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  selectedPackage, 
  onSuccess, 
  onFailure 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createSubscription, isLoading, error: paymentError } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [enableAutoPay, setEnableAutoPay] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Determine if this package supports recurring payments
  const supportsRecurring = selectedPackage.paymentType === 'recurring';
  const isOneTimePackage = !supportsRecurring;
  const totalPaymentAmount = selectedPackage.price || 0;
  
  // Load Razorpay script on component mount
  useEffect(() => {
    const loadScript = async () => {
      try {
        const loaded = await ensureRazorpayAvailable();
        setScriptLoaded(loaded);
        if (!loaded) {
          setError("Failed to load payment gateway. Please refresh and try again.");
        }
      } catch (err) {
        console.error("Error loading Razorpay script:", err);
        setError("Failed to initialize payment system. Please refresh the page.");
      } finally {
        setReady(true);
      }
    };
    
    loadScript();
    
    // Cleanup function to remove any existing Razorpay instances
    return () => {
      // Access window.Razorpay if it exists and try to close any open modals
      if (typeof (window as any).Razorpay !== 'undefined') {
        try {
          // Attempt to access any potential razorpay instance
          const razorpayInstances = (window as any)._rzp_instances;
          if (razorpayInstances && razorpayInstances.length) {
            razorpayInstances.forEach((instance: any) => {
              try {
                if (instance && typeof instance.close === 'function') {
                  instance.close();
                }
              } catch (e) {
                console.log('Error closing Razorpay instance:', e);
              }
            });
          }
        } catch (e) {
          console.log('Error during Razorpay cleanup:', e);
        }
      }
    };
  }, []);
  
  // Handle payment processing
  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log(`Initiating payment for package with autopay: ${enableAutoPay}`, selectedPackage);
      
      if (!user) {
        throw new Error("You must be logged in to make a payment.");
      }
      
      // Double-check script loading
      if (!scriptLoaded) {
        const loaded = await ensureRazorpayAvailable();
        if (!loaded) {
          throw new Error("Payment system not available. Please refresh the page.");
        }
      }
      
      // Validate package data
      if (!selectedPackage.id || !selectedPackage.price) {
        throw new Error("Invalid package data. Please refresh and try again.");
      }
      
      // Create subscription and open Razorpay checkout
      const result = await createSubscription(
        selectedPackage, 
        enableAutoPay
      );
      
      console.log('Payment success:', result);
      
      toast({
        title: "Payment Successful",
        description: `Your payment was successful.${enableAutoPay && supportsRecurring ? ' Autopay has been enabled for future payments.' : ''}`,
        variant: "success"
      });
      
      onSuccess({
        ...result,
        isRecurring: supportsRecurring && enableAutoPay,
        billingCycle: selectedPackage.billingCycle || 'yearly',
        enableAutoPay
      });
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      if (typeof error === 'object' && error !== null && 'description' in error) {
        errorMessage = (error as any).description || errorMessage;
      }
      
      // Don't show user cancelled errors as errors
      if (errorMessage.includes('cancelled by user')) {
        console.log("User cancelled payment");
      } else {
        setError(errorMessage);
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        onFailure(error);
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle retry logic
  const handleRetry = () => {
    setError(null);
    setReady(false);
    setRetryCount(0);
    
    // Reload the Razorpay script
    // This ensures we get a fresh instance of Razorpay on retry
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    setTimeout(async () => {
      try {
        const loaded = await ensureRazorpayAvailable();
        setScriptLoaded(loaded);
        if (!loaded) {
          setError("Failed to load payment gateway. Please try again later.");
        }
      } catch (err) {
        setError("Failed to initialize payment system. Please try again later.");
      } finally {
        setReady(true);
      }
    }, 1000);
  };
  
  // Sync error state from hook
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
    }
  }, [paymentError]);
  
  // Initial load effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center">Preparing payment details...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return <PaymentErrorFallback 
      error={error} 
      onRetry={handleRetry} 
      retryCount={retryCount} 
    />;
  }
  
  // Normal payment UI
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">Payment Summary</CardTitle>
        <CardDescription>Review your payment details</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">{selectedPackage.title}</span>
            <span className="font-medium">
              ₹{totalPaymentAmount}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{isOneTimePackage ? 'One-time payment' : 'Subscription'} for {selectedPackage.durationMonths || 12} months of service</p>
          </div>
          
          <div className="flex justify-between pt-2 font-medium text-primary">
            <span>Total Amount</span>
            <span>₹{totalPaymentAmount}</span>
          </div>
        </div>
        
        {supportsRecurring && (
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm">Enable AutoPay</h4>
              <p className="text-xs text-muted-foreground">
                We'll automatically renew your subscription using this payment method
              </p>
            </div>
            <Switch 
              checked={enableAutoPay}
              onCheckedChange={setEnableAutoPay}
              aria-label="Toggle autopay"
            />
          </div>
        )}
        
        <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure Payment</p>
            <p className="text-muted-foreground">
              Your payment information is securely processed
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-0 pt-2 flex flex-col space-y-2">
        <Button 
          onClick={handlePayment} 
          className="w-full" 
          disabled={isLoading || isProcessing}
        >
          {isLoading || isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLoading ? 'Loading...' : 'Processing...'}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₹{totalPaymentAmount}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  );
};

export default RazorpayPayment;
