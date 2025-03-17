
export interface SubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  popular: boolean;
  setupFee: number;
  durationMonths: number;
  termsAndConditions?: string;
  type: "Business" | "Influencer";
  billingCycle?: "monthly" | "yearly";
  advancePaymentMonths?: number;
  paymentType: "recurring" | "one-time";
}

// Empty arrays for backward compatibility with existing code
export const businessPackages: SubscriptionPackage[] = [];
export const influencerPackages: SubscriptionPackage[] = [];

// Function to get package by ID
export const getPackageById = (packageId: string, packages?: SubscriptionPackage[]): SubscriptionPackage | undefined => {
  if (packages) {
    return packages.find(pkg => pkg.id === packageId);
  }
  return undefined;
};

// Function to format price with ₹ symbol
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};
