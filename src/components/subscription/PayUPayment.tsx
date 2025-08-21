import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CreditCard, RefreshCw, Clock, List } from 'lucide-react';
import { paymentQueue } from '@/services/paymentQueue';
import PaymentFallback from './PaymentFallback';
import { toast } from 'sonner';

interface PayUPaymentProps {
  selectedPackage: any;
  user: any;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const PayUPayment: React.FC<PayUPaymentProps> = ({ selectedPackage, user, onSuccess, onFailure }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Countdown timer for rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Check queue status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInQueue) {
      interval = setInterval(() => {
        const status = paymentQueue.getQueueStatus();
        if (status.queueLength === 0) {
          setIsInQueue(false);
          setQueuePosition(null);
        } else {
          setQueuePosition(status.queueLength);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInQueue]);

  const handlePayU = async () => {
    if (!user) {
      const error = { message: 'User not authenticated' };
      onFailure(error);
      toast.error('Please log in to proceed with payment');
      return;
    }

    if (!selectedPackage) {
      const error = { message: 'No package selected' };
      onFailure(error);
      toast.error('Please select a package to continue');
      return;
    }

    // Check for rate limiting - wait at least 60 seconds between attempts
    const now = Date.now();
    if (retryCount > 0 && (now - lastAttempt) < 60000) {
      const remainingTime = Math.ceil((60000 - (now - lastAttempt)) / 1000);
      setCountdown(remainingTime);
      setIsRateLimited(true);
      toast.error(`Please wait ${remainingTime} seconds before trying again`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setLastAttempt(now);
    setIsRateLimited(false);
    setIsInQueue(true);

    try {
      // Prepare payment data with enhanced subscription information
      const txnid = 'txn_' + Date.now() + '_' + retryCount;
      const toNumber = (v: any) => {
        if (typeof v === 'number') return v;
        const n = Number(String(v).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
      };
      const priceNum = toNumber(selectedPackage.price);
      const setupFeeNum = toNumber(selectedPackage.setupFee || 0);
      const monthlyNum = toNumber(selectedPackage.monthlyPrice || selectedPackage.price);
      const totalAmount = priceNum + setupFeeNum;
      
      // Determine payment description based on package type
      let productInfo = selectedPackage.title || 'Subscription Package';
      if (selectedPackage.paymentType === 'recurring') {
        const billingCycle = selectedPackage.billingCycle === 'monthly' ? 'Monthly' : 'Yearly';
        productInfo = `${selectedPackage.title} - ${billingCycle} Subscription`;
      } else {
        productInfo = `${selectedPackage.title} - One-time Payment`;
      }
      
      // Build SI (Standing Instruction) details for Pay & Subscribe (Hosted) for ALL recurring packages
      const isAutopay = selectedPackage.paymentType === 'recurring';
      const recurringAmount = selectedPackage.billingCycle === 'monthly'
        ? monthlyNum
        : priceNum;
      const amountToCharge = isAutopay ? recurringAmount : totalAmount;
      const amountString = Number(amountToCharge).toFixed(2);

      const normalizeProductInfo = (s: string) =>
        s
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\u00A0-\u00BF]/g, ' ') // punctuation ranges & nbsp
          .replace(/[\u20B9\uFE0F]/g, '') // remove rupee sign/variation selectors
          .replace(/[^\x20-\x7E]/g, '') // strip non-ascii
          .replace(/\s+/g, ' ') // collapse spaces
          .trim()
          .slice(0, 120);
      const safeProductInfo = normalizeProductInfo(productInfo);
      const toIsoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (selectedPackage.durationMonths || 12));
      const siDetails = isAutopay ? JSON.stringify({
        billingAmount: Number(recurringAmount).toFixed(2),
        billingCurrency: 'INR',
        billingCycle: 'MONTHLY',
        billingInterval: 1,
        paymentStartDate: toIsoDate(startDate),
        paymentEndDate: toIsoDate(endDate),
      }) : undefined;

      const paymentData = {
        // key and salt are injected on server
        txnid: txnid,
        amount: amountString,
        productinfo: safeProductInfo,
        firstname: user?.name || 'User',
        email: user?.email || '',
        phone: user?.phone || '',
        surl: `${window.location.origin}/payment-success`,
        furl: `${window.location.origin}/`,
        ...(isAutopay ? { si: 4, si_details: siDetails } : {}),
        udf1: user?.id || '',
        udf2: selectedPackage.id,
        udf3: selectedPackage.type,
        udf4: selectedPackage.paymentType || 'recurring',
        udf5: selectedPackage.billingCycle || '',
        // Keep udf6-udf10 empty to match working packages hashing behavior
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
      };

      // Add payment to queue
      const payuParams = await paymentQueue.addToQueue(paymentData);
      
      // Store enhanced payment details for success/failure pages
      sessionStorage.setItem('payu_payment_details', JSON.stringify({
        packageId: selectedPackage.id,
        amount: totalAmount,
        packageName: selectedPackage.title,
        txnid,
        userEmail: user.email,
        userName: user.name,
        paymentType: selectedPackage.paymentType,
        billingCycle: selectedPackage.billingCycle,
        packageType: selectedPackage.type,
        setupFee: selectedPackage.setupFee || 0,
        durationMonths: selectedPackage.durationMonths || 12,
        advancePaymentMonths: selectedPackage.advancePaymentMonths || 0,
        monthlyPrice: selectedPackage.monthlyPrice || 0,
        isSubscription: selectedPackage.paymentType === 'recurring'
      }));

      // Dynamically create and submit form to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuParams.payuBaseUrl;
      
      Object.entries(payuParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });
      
      document.body.appendChild(form);
      form.submit();
      
      // onSuccess will be handled by redirect, but call for completeness
      onSuccess({ txnid });
      
    } catch (error) {
      console.error('PayU payment initiation error:', error);
      
      let errorMessage = 'Payment initiation failed';
      let errorDetails = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorDetails = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
        errorDetails = (error as any).message;
      }

      // Check for rate limiting error
      if (errorMessage.toLowerCase().includes('too many requests') || 
          errorMessage.toLowerCase().includes('rate limit') ||
          errorMessage.toLowerCase().includes('rate exceeded') ||
          errorMessage.toLowerCase().includes('busy')) {
        errorMessage = 'Payment service is currently busy. Please try again in a few minutes or use alternative payment method.';
        setRetryCount(prev => prev + 1);
        setCountdown(60);
        setIsRateLimited(true);
      }

      // Store error details for failure page
      sessionStorage.setItem('payu_payment_error', errorDetails);
      
      const failureError = {
        message: errorMessage,
        details: errorDetails,
        code: 'PAYMENT_INITIATION_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      setError(errorMessage);
      onFailure(failureError);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setIsInQueue(false);
    }
  };

  const handleRetry = () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before trying again`);
      return;
    }
    setError(null);
    handlePayU();
  };

  const handleFallbackSuccess = (response: any) => {
    onSuccess(response);
  };

  const handleFallbackFailure = (error: any) => {
    onFailure(error);
  };

  const handleBackToPayU = () => {
    setShowFallback(false);
    setError(null);
  };

  // Show fallback if rate limited multiple times or user chooses to
  if (showFallback || (retryCount >= 2 && isRateLimited)) {
    return (
      <PaymentFallback
        selectedPackage={selectedPackage}
        user={user}
        onSuccess={handleFallbackSuccess}
        onFailure={handleFallbackFailure}
        onBack={handleBackToPayU}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.toLowerCase().includes('too many requests') && (
                <div className="mt-2 space-y-2">
                  {countdown > 0 ? (
                    <div className="flex items-center text-sm text-red-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Please wait {countdown} seconds before retrying
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleRetry} 
                        variant="outline" 
                        size="sm"
                        className="text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Payment
                      </Button>
                      <Button 
                        onClick={() => setShowFallback(true)} 
                        variant="outline" 
                        size="sm"
                        className="text-blue-700 border-blue-300 hover:bg-blue-50"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Alternative Payment
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isInQueue && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <List className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Payment in Queue</h3>
              <p className="text-sm text-blue-700 mt-1">
                {queuePosition ? `Position in queue: ${queuePosition}` : 'Processing your payment...'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Please wait while we process your payment securely
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Payment Summary</h3>
            <p className="text-sm text-blue-700 mt-1">
              Amount: ₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Package: {selectedPackage.title}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handlePayU}
          disabled={isProcessing || isRateLimited || isInQueue}
          className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : isRateLimited ? (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Please wait {countdown} seconds
            </>
          ) : isInQueue ? (
            <>
              <List className="h-4 w-4 mr-2" />
              Payment in Queue...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to PayU Payment
            </>
          )}
        </Button>

        {(isRateLimited || retryCount > 0) && (
          <Button
            onClick={() => setShowFallback(true)}
            variant="outline"
            className="w-full"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Use Alternative Payment Method
          </Button>
        )}
      </div>

      <p className="text-xs text-center text-gray-500">
        You will be redirected to PayU's secure payment gateway
      </p>
    </div>
  );
};

export default PayUPayment; 