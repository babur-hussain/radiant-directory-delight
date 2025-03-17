
import mongoose from '../mongodb-connector.js';

const SubscriptionPackageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  features: [{ type: String }],
  price: { type: Number },
  billingCycle: { type: String },
  setupFee: { type: Number, default: 0 },
  advancePaymentMonths: { type: Number, default: 0 },
  dashboardSections: [{ type: String }],
  monthlyPrice: { type: Number },
  paymentType: { type: String, enum: ['recurring', 'one-time'], default: 'recurring' }
});

const SubscriptionPackage = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);

export default SubscriptionPackage;
