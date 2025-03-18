
import mongoose from '../mongodb-connector.js';

const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  amount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, required: true },
  advancePaymentMonths: { type: Number },
  signupFee: { type: Number },
  actualStartDate: { type: Date },
  isPaused: { type: Boolean, default: false },
  isPausable: { type: Boolean, default: false },
  isUserCancellable: { type: Boolean, default: false },
  invoiceIds: [{ type: String }],
  pausedAt: { type: Date },
  resumedAt: { type: Date },
  paymentType: { type: String, enum: ['recurring', 'one-time'] }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
