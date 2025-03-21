
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
  
  // Determine if this package supports recurring payments
  const supportsRecurring = selectedPackage.paymentType === 'recurring';
  const isOneTimePackage = !supportsRecurring;
  const totalPaymentAmount = selectedPackage.price || 0;
  
  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log(`Initiating payment for package with autopay: ${enableAutoPay}`, selectedPackage);
      
      if (!user) {
        throw new Error("You must be logged in to make a payment.");
      }
      
      const result = await createSubscription(selectedPackage, enableAutoPay);
      
      console.log('Payment success:', result);
      
      toast({
        title: "Payment Successful",
        description: `Your payment was successful.${enableAutoPay ? ' Autopay has been enabled for future payments.' : ''}`,
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
      
      setError(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      onFailure(error);
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRetry = () => {
    setError(null);
    setReady(false);
    setRetryCount(0);
    
    setTimeout(() => {
      setReady(true);
    }, 1000);
  };
  
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
    }
  }, [paymentError]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center">Preparing payment details...</p>
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
