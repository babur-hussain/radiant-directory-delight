
export const handlePhonePePaymentSuccess = (response: any) => {
  console.log('PhonePe payment successful:', response);
  return {
    success: true,
    paymentVerified: true,
    transactionId: response.merchantTransactionId,
    amount: response.amount,
    paymentMethod: 'phonepe'
  };
};

export const handlePhonePePaymentFailure = (error: any) => {
  console.error('PhonePe payment failed:', error);
  return {
    success: false,
    error: error.message || 'Payment failed',
    paymentMethod: 'phonepe'
  };
};
