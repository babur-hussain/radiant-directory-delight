import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { initiatePayUPayment } from '@/api/services/payuAPI';

interface PayUPaymentProps {
  selectedPackage: any;
  user: any;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const PayUPayment: React.FC<PayUPaymentProps> = ({ selectedPackage, user, onSuccess, onFailure }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayU = async () => {
    if (!user) {
      onFailure({ message: 'User not authenticated' });
      return;
    }
    setIsProcessing(true);
    try {
      // Prepare payment data
      const txnid = 'txn_' + Date.now();
      const paymentData = {
        key: process.env.REACT_APP_PAYU_KEY || 'YOUR_LIVE_MERCHANT_KEY',
        amount: selectedPackage.price + (selectedPackage.setupFee || 0),
        productinfo: 'Influencer Starter Package',
        firstname: user.name || 'Customer',
        email: user.email,
        phone: user.phone || '9999999999',
        txnid,
        udf1: String(user.id || user.uid || ''),
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
        surl: 'https://growbharatvyapaar.com/payment-success',
        furl: 'https://growbharatvyapaar.com/payment-failure',
      };
      // Call backend to get PayU params and hash
      const payuParams = await initiatePayUPayment(paymentData);
      // Store payment details for success page
      sessionStorage.setItem('payu_payment_details', JSON.stringify({
        packageId: selectedPackage.id,
        amount: paymentData.amount,
        packageName: selectedPackage.title,
        txnid,
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
      onFailure(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <Button onClick={handlePayU} disabled={isProcessing} className="w-full mt-4">
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {isProcessing ? 'Processing...' : 'Pay with PayU'}
      </Button>
    </div>
  );
};

export default PayUPayment; 