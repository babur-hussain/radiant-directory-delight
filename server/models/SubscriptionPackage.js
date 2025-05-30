import mongoose from 'mongoose';

const SubscriptionPackageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  monthlyPrice: { type: Number },
  setupFee: { type: Number, default: 0 },
  durationMonths: { type: Number, required: true, default: 12 },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  type: { type: String, enum: ['Business', 'Influencer'], required: true },
  termsAndConditions: { type: String, default: '' },
  paymentType: { type: String, enum: ['recurring', 'one-time'], default: 'recurring', required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'] },
  advancePaymentMonths: { type: Number, default: 0 },
  dashboardSections: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for frequently queried fields
SubscriptionPackageSchema.index({ type: 1 });
SubscriptionPackageSchema.index({ paymentType: 1 });
SubscriptionPackageSchema.index({ price: 1 });

// Pre-save middleware to ensure one-time packages have proper setup
SubscriptionPackageSchema.pre('save', function() {
  if (this.paymentType === 'one-time') {
    // For one-time packages, ensure price is set correctly
    if (!this.price || this.price <= 0) {
      console.log('Setting default price for one-time package:', this.id);
      this.price = 999;
    } else {
      console.log('One-time package price set to:', this.price);
    }
    
    // Keep setupFee as is - no longer setting it to 0 for one-time packages
    
    // Remove recurring-specific fields
    this.billingCycle = undefined;
    this.monthlyPrice = undefined;
    this.advancePaymentMonths = 0;
  } else {
    // For recurring packages, ensure billingCycle is set
    if (!this.billingCycle) {
      this.billingCycle = 'yearly';
    }
  }
});

export default mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
