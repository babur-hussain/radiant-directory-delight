
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
  const handleSuccess = (response: any) => {
    console.log('Payment successful:', response);
    
    // Add package details to response for easier access
    const completeResponse = {
      ...response,
      packageDetails: packageData,
      amount: (packageData.price || 0) + (packageData.setupFee || 0), // Include setup fee
      isOneTime: packageData.paymentType === 'one-time',
      isSubscription: packageData.paymentType === 'recurring',
      // Add critical flags to prevent refunds
      preventRefunds: true,
      isNonRefundable: true,
      autoRefund: false
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
  
  return { handleSuccess, handleDismiss, handleError };
};
