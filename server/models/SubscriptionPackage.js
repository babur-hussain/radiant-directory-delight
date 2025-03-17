
import mongoose from '../mongodb-connector.js';

const SubscriptionPackageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  monthlyPrice: { type: Number },
  shortDescription: { type: String },
  fullDescription: { type: String },
  features: [{ type: String }],
  durationMonths: { type: Number, default: 12 },
  popular: { type: Boolean, default: false },
  type: { type: String, required: true, enum: ['Business', 'Influencer'] },
  setupFee: { type: Number, default: 0 },
  billingCycle: { type: String, enum: ['monthly', 'yearly'] },
  advancePaymentMonths: { type: Number, default: 0 },
  termsAndConditions: { type: String },
  dashboardSections: [{ type: String }],
  paymentType: { type: String, enum: ['recurring', 'one-time'], default: 'recurring' }
});

// Add pre-save hook to ensure proper data formatting
SubscriptionPackageSchema.pre('save', function(next) {
  // Ensure one-time packages have proper setup
  if (this.paymentType === 'one-time') {
    this.billingCycle = undefined;
    this.setupFee = 0;
    this.advancePaymentMonths = 0;
  }
  
  // Ensure required fields have values
  if (!this.shortDescription && this.fullDescription) {
    this.shortDescription = this.fullDescription.substring(0, 100);
  }
  
  next();
});

const SubscriptionPackage = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);

export default SubscriptionPackage;
