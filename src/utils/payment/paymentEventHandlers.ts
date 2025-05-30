
/**
 * Create payment event handlers for PhonePe checkout
 */
export const createPaymentHandlers = (
  packageData: any,
  toast: any,
  onSuccess: (response: any) => void,
  onDismiss: () => void,
  onError: (error: any) => void
) => {
  // Create a persistent transaction ID for this payment flow
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  const handleSuccess = (response: any) => {
    console.log('Payment successful:', response);
    
    // Validate payment response
    if (!response.success || response.code !== 'PAYMENT_SUCCESS') {
      console.error('Invalid payment response:', response);
      handleError({ message: 'Payment verification failed', response });
      return;
    }
    
    // Add package details to response for easier access
    const completeResponse = {
      ...response,
      packageDetails: packageData,
      amount: (packageData.price || 0) + (packageData.setupFee || 0),
      isOneTime: packageData.paymentType === 'one-time',
      isSubscription: packageData.paymentType === 'recurring',
      // Payment verification flags
      transaction_id: response.data?.merchantTransactionId || transactionId,
      paymentVerified: true,
      paymentConfirmed: new Date().toISOString(),
      supportPhone: "6232571406",
      paymentTimestamp: Date.now(),
      paymentSignature: response.data?.transactionId || "phonepe_verified",
    };
    
    toast({
      title: "Payment Successful",
      description: `Your payment for ${packageData.title} has been processed successfully.`,
    });
    
    onSuccess(completeResponse);
  };
  
  const handleDismiss = () => {
    console.log('Payment dismissed');
    toast({
      title: "Payment Cancelled",
      description: "You've cancelled the payment process. Your subscription is not active.",
    });
    onDismiss();
  };
  
  const handleError = (error: any) => {
    console.error('Payment error:', error);
    
    let errorMessage = "Payment failed. Please try again.";
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    }
    
    toast({
      title: "Payment Failed",
      description: `${errorMessage} Contact 6232571406 for assistance.`,
      variant: "destructive"
    });
    onError(error);
  };
  
  return { 
    handleSuccess, 
    handleDismiss, 
    handleError,
    transactionId 
  };
};
