
/**
 * Create payment event handlers for Razorpay checkout
 */
export const createPaymentHandlers = (
  packageData: any,
  toast: any,
  onSuccess: (response: any) => void,
  onDismiss: () => void,
  onError: (error: any) => void
) => {
  // Create a persistent transaction ID for this payment flow
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  const handleSuccess = (response: any) => {
    console.log('Payment successful:', response);
    
    // Add package details to response for easier access
    const completeResponse = {
      ...response,
      packageDetails: packageData,
      amount: (packageData.price || 0) + (packageData.setupFee || 0), // Include setup fee
      isOneTime: packageData.paymentType === 'one-time',
      isSubscription: packageData.paymentType === 'recurring',
      // Strengthen critical flags to prevent refunds
      preventRefunds: true,
      isNonRefundable: true,
      autoRefund: false,
      refundStatus: "no_refund_allowed",
      refundsDisabled: true,
      refundPolicy: "no_refunds",
      isVerifiedPayment: true,
      nonRefundableTransaction: true,
      // Use consistent transaction ID
      transaction_id: response.transaction_id || response.razorpay_payment_id || transactionId,
      // Add verification flag
      paymentVerified: true,
      paymentConfirmed: new Date().toISOString()
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
      description: "You've cancelled the payment process.",
    });
    onDismiss();
  };
  
  const handleError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: error.description || error.message || "Something went wrong with your payment.",
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
