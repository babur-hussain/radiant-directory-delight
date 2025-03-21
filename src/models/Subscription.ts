
import { Database } from '@/integrations/supabase/types';

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

// Map Supabase data to our application model
export const mapFromSupabase = (data: Database['public']['Tables']['user_subscriptions']['Row']): ISubscription => {
  return {
    id: data.id,
    userId: data.user_id || '',
    packageId: data.package_id || '',
    packageName: data.package_name || '',
    amount: data.amount,
    startDate: data.start_date ? new Date(data.start_date).toISOString() : new Date().toISOString(),
    endDate: data.end_date ? new Date(data.end_date).toISOString() : new Date().toISOString(),
    status: data.status || 'pending',
    assignedBy: data.assigned_by,
    assignedAt: data.assigned_at ? new Date(data.assigned_at).toISOString() : undefined,
    advancePaymentMonths: data.advance_payment_months,
    signupFee: data.signup_fee,
    actualStartDate: data.actual_start_date ? new Date(data.actual_start_date).toISOString() : undefined,
    isPaused: data.is_paused,
    isPausable: data.is_pausable,
    isUserCancellable: data.is_user_cancellable,
    invoiceIds: data.invoice_ids,
    paymentType: data.payment_type,
    paymentMethod: data.payment_method,
    transactionId: data.transaction_id,
    cancelledAt: data.cancelled_at ? new Date(data.cancelled_at).toISOString() : undefined,
    cancelReason: data.cancel_reason,
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at).toISOString() : undefined
  };
};

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
