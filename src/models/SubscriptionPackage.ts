
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
  metadata?: Record<string, any>;
}

// Export the interface as SubscriptionPackage type alias for backward compatibility
export type SubscriptionPackage = ISubscriptionPackage;
