
// Define the interface for subscription packages
export interface ISubscriptionPackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  type: string;
  duration: number;
  features?: string[];
  isActive?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  displayOrder?: number;
  discountPercentage?: number;
  maxUsers?: number;
  isPopular?: boolean;
  
  // Additional fields needed for subscription functionality
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  setupFee?: number;
  durationMonths?: number;
  paymentType?: "recurring" | "one-time";
  billingCycle?: "monthly" | "yearly";
  advancePaymentMonths?: number;
  monthlyPrice?: number;
  popular?: boolean;
  dashboardSections?: string[];
  metadata?: Record<string, any>;
}

// Export the interface as SubscriptionPackage type alias for backward compatibility
export type SubscriptionPackage = ISubscriptionPackage;

// Export a mongoose model reference for use in server code
// This is a dummy export to be overridden by the actual mongoose model
// when imported in server-side code
import { Model } from 'mongoose';
const dummyModel = {} as Model<ISubscriptionPackage>;
export const SubscriptionPackage = dummyModel;

// For client-side code that needs to reference the model name
export const SUBSCRIPTION_PACKAGE_MODEL = 'SubscriptionPackage';
