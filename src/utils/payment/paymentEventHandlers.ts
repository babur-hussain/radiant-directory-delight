
/**
 * Create payment event handlers for Paytm checkout
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
    
    // Add package details to response for easier access
    const completeResponse = {
      ...response,
      packageDetails: packageData,
      amount: (packageData.price || 0) + (packageData.setupFee || 0),
      isOneTime: packageData.paymentType === 'one-time',
      isSubscription: packageData.paymentType === 'recurring',
      // Payment verification flags
      preventRefunds: true,
      isNonRefundable: true,
      autoRefund: false,
      refundStatus: "no_refund_allowed",
      refundsDisabled: true,
      refundPolicy: "no_refunds",
      isVerifiedPayment: true,
      nonRefundableTransaction: true,
      transaction_id: response.TXNID || transactionId,
      paymentVerified: true,
      paymentConfirmed: new Date().toISOString(),
      supportPhone: "6232571406",
      paymentTimestamp: Date.now(),
      paymentSignature: response.CHECKSUMHASH || "paytm_verified",
    };
    
    toast({
      title: "Payment Successful",
      description: `Your payment for ${packageData.title} has been processed.`,
    });
    
    onSuccess(completeResponse);
  };
  
  const handleDismiss = () => {
    console.log('Payment dismissed');
    toast({
      title: "Payment Cancelled",
      description: "You've cancelled the payment process. Contact 6232571406 for assistance.",
    });
    onDismiss();
  };
  
  const handleError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: error.RESPMSG || error.message || "Something went wrong with your payment. Contact 6232571406 for assistance.",
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
