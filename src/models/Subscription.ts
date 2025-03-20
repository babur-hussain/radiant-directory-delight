
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

// Add this export for compatibility with existing code
export class Subscription implements ISubscription {
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

  constructor(data: ISubscription) {
    this.id = data.id;
    this.userId = data.userId;
    this.packageId = data.packageId;
    this.packageName = data.packageName;
    this.amount = data.amount;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.status = data.status;
    this.assignedBy = data.assignedBy;
    this.assignedAt = data.assignedAt;
    this.advancePaymentMonths = data.advancePaymentMonths;
    this.signupFee = data.signupFee;
    this.actualStartDate = data.actualStartDate;
    this.isPaused = data.isPaused;
    this.isPausable = data.isPausable;
    this.isUserCancellable = data.isUserCancellable;
    this.invoiceIds = data.invoiceIds;
    this.paymentType = data.paymentType;
    this.paymentMethod = data.paymentMethod;
    this.transactionId = data.transactionId;
    this.cancelledAt = data.cancelledAt;
    this.cancelReason = data.cancelReason;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Add compatibility static methods
  static async create(data: ISubscription) {
    console.warn('Subscription.create is a compatibility method, not implemented fully');
    return new Subscription(data);
  }
}
