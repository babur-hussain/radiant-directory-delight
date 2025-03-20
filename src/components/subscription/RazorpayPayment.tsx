
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Shield, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';

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
  const { initiatePayment, isLoading, error: paymentError } = useRazorpayPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(true);
  
  // Determine if this is a one-time package
  const isOneTimePackage = selectedPackage.paymentType === "one-time";
  
  // Calculate the amount based on payment type
  // Ensure one-time packages have proper pricing
  const paymentAmount = isOneTimePackage 
    ? (selectedPackage.price || 999) // Default to 999 if price is 0 or undefined
    : (selectedPackage.setupFee || 0);
  
  // For recurring packages, also calculate the recurring amount
  const recurringAmount = !isOneTimePackage ? (selectedPackage.price || 0) : 0;
  
  const handlePayment = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    initiatePayment({
      selectedPackage,
      onSuccess: (response) => {
        console.log("Payment success in RazorpayPayment:", response);
        onSuccess(response);
        setIsProcessing(false);
      },
      onFailure: (error) => {
        console.error("Payment failure in RazorpayPayment:", error);
        setError(error.message || "Payment could not be completed. Please try again.");
        onFailure(error);
        setIsProcessing(false);
        
        // Increment retry count to track failed attempts
        setRetryCount(prevCount => prevCount + 1);
      }
    });
  };
  
  const handleRetry = () => {
    setError(null);
    setLoadingScript(true);
    setRetryCount(0); // Reset retry count
    
    // Reset states and try again
    setTimeout(() => {
      setLoadingScript(false);
      handlePayment();
    }, 1000);
  };
  
  useEffect(() => {
    // Only auto-trigger payment after a short delay
    const timer = setTimeout(() => {
      setLoadingScript(false);
      if (!isProcessing && !isLoading && !error && retryCount === 0) {
        handlePayment();
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Use payment error from the hook if available
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
    }
  }, [paymentError]);
  
  if (loadingScript) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center">Preparing payment gateway...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          {retryCount >= 2 ? (
            <div className="mt-2">
              <p className="text-sm mb-2">We're experiencing issues with the payment provider. You can:</p>
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={isProcessing}
                  className="flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isProcessing}
              >
                Try Again
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
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
              ₹{isOneTimePackage 
                ? (selectedPackage.price || 999) // Default to 999 if price is 0
                : (selectedPackage.setupFee || 0)}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isOneTimePackage ? (
              <p>One-time payment for {selectedPackage.durationMonths || 12} months of service</p>
            ) : (
              <>
                <p>Initial setup fee payment</p>
                <p className="mt-1">Your subscription will begin after this payment is processed.</p>
                {recurringAmount > 0 && (
                  <p className="mt-2 font-medium">Recurring payment: ₹{recurringAmount}/{selectedPackage.billingCycle || 'year'}</p>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-between pt-2 font-medium text-primary">
            <span>Total Amount</span>
            <span>₹{isOneTimePackage ? (selectedPackage.price || 999) : paymentAmount}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure Payment</p>
            <p className="text-muted-foreground">Your payment information is securely processed</p>
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
              {isOneTimePackage 
                ? `Pay ₹${selectedPackage.price || 999}` // Default to 999 if price is 0
                : `Pay Setup Fee ₹${selectedPackage.setupFee || 0}`}
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
