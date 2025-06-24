import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentErrorFallback from '@/components/subscription/PaymentErrorFallback';
import Layout from '@/components/layout/Layout';

const PaymentRetryPage: React.FC = () => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  // Try to get the last payment error and package details from sessionStorage
  const paymentDetails = sessionStorage.getItem('payu_payment_details');
  let error = sessionStorage.getItem('payu_payment_error') || 'Your payment was unsuccessful.';
  let packageId: string | null = null;
  if (paymentDetails) {
    try {
      const details = JSON.parse(paymentDetails);
      packageId = details.packageId;
    } catch {
      error = 'Could not parse payment details.';
    }
  } else {
    error = 'No payment details found. Please select a subscription package again.';
  }

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    if (packageId) {
      navigate(`/subscription/${packageId}`);
    } else {
      navigate('/subscription');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="max-w-md w-full">
          <PaymentErrorFallback error={error} onRetry={handleRetry} retryCount={retryCount} />
        </div>
      </div>
    </Layout>
  );
};

export default PaymentRetryPage; 