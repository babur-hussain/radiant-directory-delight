import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Shield, Loader2, RefreshCw, Calendar, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  
  const isOneTimePackage = selectedPackage.paymentType === "one-time";
  
  const canUseRecurring = !isOneTimePackage && selectedPackage.billingCycle !== undefined;
  
  const setupFee = selectedPackage.setupFee || 0;
  
  const recurringAmount = isOneTimePackage ? 0 : (
    selectedPackage.billingCycle === 'monthly' 
      ? (selectedPackage.monthlyPrice || 0)
      : (selectedPackage.price || 0)
  );
  
  const advanceMonths = isOneTimePackage ? 0 : (selectedPackage.advancePaymentMonths || 0);
  
  const advanceAmount = selectedPackage.billingCycle === 'monthly'
    ? (selectedPackage.monthlyPrice || 0) * advanceMonths
    : (selectedPackage.price || 0);
  
  const totalPaymentAmount = isOneTimePackage 
    ? (selectedPackage.price || 0)
    : (setupFee + (advanceMonths > 0 ? advanceAmount : 0));
  
  const firstRecurringDate = new Date();
  if (advanceMonths > 0) {
    firstRecurringDate.setMonth(firstRecurringDate.getMonth() + advanceMonths);
  } else if (selectedPackage.billingCycle === 'yearly') {
    firstRecurringDate.setFullYear(firstRecurringDate.getFullYear() + 1);
  } else {
    firstRecurringDate.setMonth(firstRecurringDate.getMonth() + 1);
  }
  
  const formattedFirstRecurringDate = formatSubscriptionDate(firstRecurringDate);

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log(`Initiating ${isOneTimePackage ? 'one-time payment' : 'subscription'} for package:`, selectedPackage);
      
      const result = await createSubscription(selectedPackage);
      
      console.log('Payment success:', result);
      
      toast({
        title: "Payment Successful",
        description: `Your ${isOneTimePackage ? 'payment' : 'subscription'} was successful.`,
      });
      
      onSuccess({
        ...result,
        isRecurring: canUseRecurring,
        nextBillingDate: formattedFirstRecurringDate,
        recurringAmount: recurringAmount,
        billingCycle: selectedPackage.billingCycle || 'monthly'
      });
    } catch (error) {
      console.error('Payment error:', error);
      
      setError(error instanceof Error ? error.message : 'Payment failed');
      
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Payment could not be processed',
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
            {isOneTimePackage ? (
              <p>One-time payment for {selectedPackage.durationMonths || 12} months of service</p>
            ) : (
              <>
                {setupFee > 0 && (
                  <div className="flex justify-between">
                    <span>Setup fee</span>
                    <span>₹{setupFee}</span>
                  </div>
                )}
                
                {advanceMonths > 0 && (
                  <div className="flex justify-between mt-1">
                    <span>Advance payment ({advanceMonths} {selectedPackage.billingCycle === 'monthly' ? 'months' : 'years'})</span>
                    <span>₹{advanceAmount}</span>
                  </div>
                )}
                
                {canUseRecurring && (
                  <div className="mt-2 bg-blue-50 p-3 rounded text-blue-800 flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Automatic Payments Enabled</p>
                      <p className="text-xs mt-1">
                        Your subscription will begin immediately. Recurring payment of ₹{recurringAmount} will be automatically charged every {selectedPackage.billingCycle || 'month'} starting from {formattedFirstRecurringDate}.
                      </p>
                      <div className="mt-2 text-xs flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        <span>Hassle-free automatic billing</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {!canUseRecurring && advanceMonths > 0 && (
                  <p className="mt-2">Your subscription will begin immediately. You'll need to renew manually after {advanceMonths} months.</p>
                )}
                
                {recurringAmount > 0 && (
                  <p className="mt-2 font-medium">Recurring payment: ₹{recurringAmount}/{selectedPackage.billingCycle || 'month'}</p>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-between pt-2 font-medium text-primary">
            <span>Total Amount</span>
            <span>₹{totalPaymentAmount}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure Payment</p>
            <p className="text-muted-foreground">
              {canUseRecurring 
                ? "Automatic renewal ensures uninterrupted service" 
                : "Your payment information is securely processed"}
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
              {canUseRecurring
                ? `Pay ₹${totalPaymentAmount} and setup auto-pay` 
                : `Pay ₹${totalPaymentAmount}`}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
          {canUseRecurring && " including automatic renewal terms"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default RazorpayPayment;

