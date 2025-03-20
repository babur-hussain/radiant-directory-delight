
import { mongoose } from '../config/mongodb';

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  setupFee?: number;
  durationMonths: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  popular: boolean;
  type: "Business" | "Influencer";
  termsAndConditions?: string;
  paymentType: "recurring" | "one-time";
  billingCycle?: "monthly" | "yearly";
  advancePaymentMonths?: number;
  dashboardSections?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  maxBusinesses?: number;
  maxInfluencers?: number;
}

// Create a schema using the mongoose mock
const SubscriptionPackageSchema = {
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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  maxBusinesses: { type: Number, default: 1 },
  maxInfluencers: { type: Number, default: 1 }
};

// Add index and pre methods for mock implementation
SubscriptionPackageSchema.index = function(field: any) {
  // This is a mock implementation that does nothing
  return;
};

SubscriptionPackageSchema.pre = function(action: string, callback: Function) {
  // This is a mock implementation that does nothing
  return;
};

// Create indexes for frequently queried fields
SubscriptionPackageSchema.index({ type: 1 });
SubscriptionPackageSchema.index({ paymentType: 1 });
SubscriptionPackageSchema.index({ price: 1 });

// Pre-save middleware to ensure one-time packages have proper setup
SubscriptionPackageSchema.pre('save', function() {
  // Mock implementation for pre-save hook
});

export const SubscriptionPackage = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
