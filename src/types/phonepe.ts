
export interface PhonePeOptions {
  merchantId: string;
  merchantTransactionId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl?: string;
  paymentInstrument: {
    type: string;
  };
  merchantUserId: string;
}

export interface PhonePeResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument: {
      type: string;
      pgTransactionId: string;
      pgServiceTransactionId: string;
      bankTransactionId?: string;
      bankId?: string;
      [key: string]: any;
    };
  };
}

export interface SubscriptionResult {
  merchantTransactionId: string;
  amount: number;
  isOneTime: boolean;
  isSubscription: boolean;
  enableAutoPay: boolean;
  setupFee?: number;
  advanceMonths?: number;
  nextBillingDate?: string;
  totalPackageMonths?: number;
  remainingAmount?: number;
  totalAmount?: number;
  recurringPaymentAmount?: number;
  recurringPaymentCount?: number;
}

export interface EnhancedPaymentResponse extends PhonePeResponse {
  isRecurring?: boolean;
  enableAutoPay?: boolean;
  billingCycle?: string;
  initialPayment?: number;
  recurringAmount?: number;
  totalPackageValue?: number;
  remainingAmount?: number;
  recurringPaymentCount?: number;
  packageDuration?: number;
  nextBillingDate?: string;
  packageEndDate?: string;
}
