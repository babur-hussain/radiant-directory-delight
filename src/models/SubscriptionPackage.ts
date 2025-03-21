
// Define the ISubscriptionPackage type to properly reflect the structure needed
export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  shortDescription?: string;
  fullDescription?: string;
  features: string[];
  setupFee?: number;
  popular?: boolean;
  type: 'Business' | 'Influencer';
  durationMonths?: number;
  advancePaymentMonths?: number;
  paymentType: 'recurring' | 'one-time';
  billingCycle?: 'monthly' | 'yearly';
  termsAndConditions?: string;
  dashboardSections?: string[];
}
