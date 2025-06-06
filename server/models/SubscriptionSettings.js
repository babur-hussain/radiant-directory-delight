
import mongoose from 'mongoose';

const SubscriptionSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, default: 'global', unique: true },
  shouldUseLocalFallback: { type: Boolean, default: true },
  allowNonAdminSubscriptions: { type: Boolean, default: true },
  requiresPayment: { type: Boolean, default: false },
  defaultGracePeriodDays: { type: Number, default: 7 },
  defaultAdvancePaymentMonths: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SubscriptionSettings', SubscriptionSettingsSchema);
