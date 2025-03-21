
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Shield, Loader2, RefreshCw, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay } from '@/hooks/useRazorpay';
import { ensureRazorpayAvailable } from '@/utils/razorpayLoader';
import PaymentErrorFallback from './PaymentErrorFallback';
import { formatSubscriptionDate } from '@/utils/razorpay';

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
  
  // Get package duration
  const packageDuration = selectedPackage.durationMonths || 12;
  
  // Calculate payment details
  const setupFee = selectedPackage.setupFee || 0;
  const monthlyAmount = selectedPackage.monthlyPrice || 0;
  const yearlyAmount = selectedPackage.price || 0;
  const advanceMonths = selectedPackage.advancePaymentMonths || 0;
  
  // Calculate the next billing date after advance months
  const getNextBillingDate = () => {
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setMonth(today.getMonth() + (advanceMonths || 1));
    return formatSubscriptionDate(nextDate);
  };
  
  // Calculate the final package end date
  const getPackageEndDate = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + packageDuration);
    return formatSubscriptionDate(endDate);
  };
  
  // Calculate totals based on package type
  let initialPayment = 0;
  let recurringAmount = 0;
  let totalPackageValue = 0;
  let remainingAmount = 0;
  let recurringPaymentCount = 0;
  
  if (isOneTimePackage) {
    // One-time payment
    initialPayment = yearlyAmount;
    totalPackageValue = yearlyAmount;
    recurringAmount = 0;
    remainingAmount = 0;
    recurringPaymentCount = 0;
  } else {
    // Calculate total package value first
    if (selectedPackage.billingCycle === 'monthly') {
      totalPackageValue = setupFee + (monthlyAmount * packageDuration);
    } else {
      // For yearly billing
      const totalYears = Math.ceil(packageDuration / 12);
      totalPackageValue = setupFee + (yearlyAmount * totalYears);
    }
    
    // Calculate initial payment (setup fee + advance months)
    initialPayment = setupFee;
    if (advanceMonths > 0) {
      if (selectedPackage.billingCycle === 'monthly') {
        initialPayment += monthlyAmount * advanceMonths;
      } else {
        initialPayment += yearlyAmount;
      }
    }
    
    // Calculate remaining amount for autopay
    remainingAmount = Math.max(0, totalPackageValue - initialPayment);
    
    // Calculate recurring payment amount based on billing cycle
    recurringAmount = selectedPackage.billingCycle === 'monthly' ? monthlyAmount : yearlyAmount;
    
    // Calculate number of recurring payments needed
    if (advanceMonths >= packageDuration) {
      // No recurring payments needed if advance covers entire duration
      recurringPaymentCount = 0;
    } else {
      // Calculate remaining payments needed
      const remainingMonths = packageDuration - advanceMonths;
      if (selectedPackage.billingCycle === 'monthly') {
        recurringPaymentCount = remainingMonths;
      } else {
        // For yearly billing, calculate years (rounded up)
        recurringPaymentCount = Math.ceil(remainingMonths / 12);
      }
    }
  }
  
  // Total amount to be collected now
  const totalPaymentAmount = initialPayment;
  
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
        enableAutoPay,
        initialPayment,
        recurringAmount,
        totalPackageValue,
        remainingAmount,
        recurringPaymentCount,
        packageDuration,
        nextBillingDate: getNextBillingDate(),
        packageEndDate: getPackageEndDate()
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
          <div className="flex justify-between">
            <span className="font-medium">{selectedPackage.title}</span>
            <span className="font-medium">
              ₹{selectedPackage.price}
              {supportsRecurring ? (
                <span className="text-xs text-muted-foreground">
                  /{selectedPackage.billingCycle || 'yearly'}
                </span>
              ) : ''}
            </span>
          </div>
          
          {setupFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Setup fee</span>
              <span>₹{setupFee}</span>
            </div>
          )}
          
          {supportsRecurring && advanceMonths > 0 && (
            <div className="flex justify-between text-sm">
              <span>Advance payment ({advanceMonths} months)</span>
              <span>₹{selectedPackage.billingCycle === 'monthly' ? 
                (monthlyAmount * advanceMonths) : 
                yearlyAmount}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Initial payment (today)</span>
            <span>₹{initialPayment}</span>
          </div>
          
          {supportsRecurring && enableAutoPay && remainingAmount > 0 && (
            <>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total package value (validity: {packageDuration} months)</span>
                <span>₹{totalPackageValue}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Remaining amount (autopay)</span>
                <span>₹{remainingAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Number of future payments</span>
                <span>{recurringPaymentCount}</span>
              </div>
            </>
          )}
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
        
        {enableAutoPay && supportsRecurring && (
          <>
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Next payment on {getNextBillingDate()}</p>
                <p className="text-blue-600">
                  {recurringPaymentCount > 0 
                    ? `Your subscription will auto-renew with ${recurringPaymentCount} remaining payment${recurringPaymentCount !== 1 ? 's' : ''} of ₹${recurringAmount} each.`
                    : 'No future payments needed - your subscription is fully paid.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Subscription ends on {getPackageEndDate()}</p>
                <p className="text-amber-600">
                  Your total subscription duration is {packageDuration} months.
                </p>
              </div>
            </div>
          </>
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
