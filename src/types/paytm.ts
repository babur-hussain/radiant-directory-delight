
export interface PaytmOptions {
  mid: string;
  orderId: string;
  amount: string;
  txnToken: string;
  callbackUrl?: string;
  isStaging?: boolean;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export interface PaytmResponse {
  TXNID?: string;
  BANKTXNID?: string;
  ORDERID?: string;
  TXNAMOUNT?: string;
  STATUS?: string;
  TXNTYPE?: string;
  GATEWAYNAME?: string;
  RESPCODE?: string;
  RESPMSG?: string;
  BANKNAME?: string;
  MID?: string;
  PAYMENTMODE?: string;
  REFUNDAMT?: string;
  TXNDATE?: string;
  CHECKSUMHASH?: string;
  [key: string]: any;
}

export interface SubscriptionResult {
  orderId?: string;
  txnToken?: string;
  amount?: number;
  isOneTime: boolean;
  isSubscription: boolean;
  enableAutoPay: boolean;
  currency?: string;
  setupFee?: number;
  advanceMonths?: number;
  nextBillingDate?: string;
  totalPackageMonths?: number;
  remainingAmount?: number;
  totalAmount?: number;
  recurringPaymentAmount?: number;
  recurringPaymentCount?: number;
  autopayDetails?: AutopayDetails;
}

export interface AutopayDetails {
  enabled: boolean;
  nextBillingDate?: string;
  recurringAmount?: number;
  remainingPayments?: number;
  totalRemainingAmount?: number;
}

export interface EnhancedPaymentResponse extends PaytmResponse {
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
  autopayDetails?: AutopayDetails;
}
