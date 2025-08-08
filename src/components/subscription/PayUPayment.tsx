import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CreditCard } from 'lucide-react';
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

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare payment data with enhanced subscription information
      const txnid = 'txn_' + Date.now();
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
        hash: hash,
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
    <div className="flex flex-col items-center justify-center py-4 space-y-4">
      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Payment Error</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="w-full">
        <Button 
          onClick={handlePayU} 
          disabled={isProcessing} 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{selectedPackage.price + (selectedPackage.setupFee || 0)} with PayU
            </>
          )}
        </Button>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Secure payment powered by PayU • All transactions are encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayUPayment; 