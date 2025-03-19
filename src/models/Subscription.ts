
import { mongoose } from '../config/mongodb';

export interface ISubscription {
  id: string;
  packageId: string;
  packageName: string;
  userId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  assignedBy?: string;
  assignedAt?: string;
  advancePaymentMonths?: number;
  signupFee?: number;
  actualStartDate?: string;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  paymentType?: 'recurring' | 'one-time';
  cancelledAt?: string;
  cancelReason?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Create the Mongoose schema
const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  assignedBy: { type: String },
  assignedAt: { type: String },
  advancePaymentMonths: { type: Number, default: 0 },
  signupFee: { type: Number, default: 0 },
  actualStartDate: { type: String },
  isPaused: { type: Boolean, default: false },
  isPausable: { type: Boolean, default: true },
  isUserCancellable: { type: Boolean, default: true },
  invoiceIds: [{ type: String }],
  paymentType: { type: String, enum: ['recurring', 'one-time'], default: 'recurring' },
  cancelledAt: { type: String },
  cancelReason: { type: String },
  paymentMethod: { type: String },
  transactionId: { type: String }
});

// Create indexes for frequently queried fields
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ packageId: 1 });

// Export the model
export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
