
import mongoose from 'mongoose';

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
  paymentType: { type: String, enum: ['recurring', 'one-time'], default: 'recurring' }
});

// Create indexes for frequently queried fields
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ packageId: 1 });

export default mongoose.model('Subscription', SubscriptionSchema);
