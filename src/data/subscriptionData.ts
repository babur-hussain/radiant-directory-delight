
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
  dashboardSections?: string[];
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

// Helper function to convert ISubscriptionPackage to SubscriptionPackage
export const convertToSubscriptionPackage = (pkg: any): SubscriptionPackage => {
  return {
    id: pkg.id || '',
    title: pkg.title || '',
    price: pkg.price || 0,
    monthlyPrice: pkg.monthlyPrice,
    shortDescription: pkg.shortDescription || pkg.title || '',
    fullDescription: pkg.fullDescription || pkg.shortDescription || '',
    features: Array.isArray(pkg.features) ? pkg.features : [],
    popular: !!pkg.popular,
    setupFee: pkg.setupFee || 0,
    durationMonths: pkg.durationMonths || 12,
    termsAndConditions: pkg.termsAndConditions,
    type: pkg.type || 'Business',
    billingCycle: pkg.billingCycle,
    advancePaymentMonths: pkg.advancePaymentMonths,
    paymentType: pkg.paymentType || 'recurring',
    dashboardSections: pkg.dashboardSections || []
  };
};
