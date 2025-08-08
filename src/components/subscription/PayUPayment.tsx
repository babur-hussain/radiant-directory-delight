import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';
import { initiatePayUPayment } from '@/api/services/payuAPI';
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
      toast.error(`Please wait ${remainingTime} seconds before trying again`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setLastAttempt(now);

    try {
      // Prepare payment data with enhanced subscription information
      const txnid = 'txn_' + Date.now() + '_' + retryCount;
      const totalAmount = selectedPackage.price + (selectedPackage.setupFee || 0);
      
      // Determine payment description based on package type
      let productInfo = selectedPackage.title || 'Subscription Package';
      if (selectedPackage.paymentType === 'recurring') {
        const billingCycle = selectedPackage.billingCycle === 'monthly' ? 'Monthly' : 'Yearly';
        productInfo = `${selectedPackage.title} - ${billingCycle} Subscription`;
      } else {
        productInfo = `${selectedPackage.title} - One-time Payment`;
      }
      
      const paymentData = {
        key: 'JPMALL',
        salt: 'HnM0HqM1',
        txnid: txnid,
        amount: totalAmount,
        productinfo: productInfo,
        firstname: user?.name || 'User',
        email: user?.email || '',
        phone: user?.phone || '',
        surl: `${window.location.origin}/payment-success`,
        furl: `${window.location.origin}/`,
        udf1: user?.id || '',
        udf2: selectedPackage.id,
        udf3: selectedPackage.type,
        udf4: selectedPackage.paymentType || 'recurring',
        udf5: selectedPackage.billingCycle || '',
        udf6: selectedPackage.type || '',
        udf7: selectedPackage.setupFee?.toString() || '0',
        udf8: selectedPackage.durationMonths?.toString() || '12',
        udf9: selectedPackage.advancePaymentMonths?.toString() || '0',
        udf10: selectedPackage.monthlyPrice?.toString() || '0',
      };

      // Call backend to get PayU params and hash
      const payuParams = await initiatePayUPayment(paymentData);
      
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
      if (errorMessage.toLowerCase().includes('too many requests') || errorMessage.toLowerCase().includes('rate limit')) {
        errorMessage = 'Too many payment requests. Please wait 60 seconds before trying again.';
        setRetryCount(prev => prev + 1);
      }

      // Store error details for failure page
      sessionStorage.setItem('payu_payment_error', errorDetails);
      
      const failureError = {
        message: errorMessage,
        details: errorDetails,
        code: 'PAYMENT_INITIATION_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      onFailure(failureError);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handlePayU();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.toLowerCase().includes('too many requests') && (
                <div className="mt-2">
                  <Button 
                    onClick={handleRetry} 
                    variant="outline" 
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment
                  </Button>
                </div>
              )}
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

      <Button
        onClick={handlePayU}
        disabled={isProcessing}
        className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to PayU Payment
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        You will be redirected to PayU's secure payment gateway
      </p>
    </div>
  );
};

export default PayUPayment; 