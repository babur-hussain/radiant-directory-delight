
export interface ISubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  assignedBy?: string;
  assignedAt?: string;
  advancePaymentMonths?: number;
  signupFee?: number;
  actualStartDate?: string;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  paymentType?: string;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}
