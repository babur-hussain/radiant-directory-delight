
// Define the ISubscriptionPackage type to properly reflect the structure needed
export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  shortDescription?: string;
  fullDescription?: string;  // Can now store long text paragraphs
  features: string[];        // Array of feature strings
  setupFee?: number;
  popular?: boolean;
  type: 'Business' | 'Influencer';
  durationMonths?: number;
  advancePaymentMonths?: number;
  paymentType: 'recurring' | 'one-time';
  billingCycle?: 'monthly' | 'yearly';
  termsAndConditions?: string;  // Can now store long text paragraphs
  dashboardSections?: string[];
  isActive?: boolean;
}
