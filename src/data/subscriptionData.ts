
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

// Empty arrays - no dummy data
export const businessPackages: SubscriptionPackage[] = [];
export const influencerPackages: SubscriptionPackage[] = [];

// Function to get package by ID - returns undefined if not found
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
  // Handle features parsing - it might be a string, JSON string with checkmarks, or already an array
  let parsedFeatures: string[] = [];
  
  if (pkg.features) {
    if (Array.isArray(pkg.features)) {
      // Already an array, use as is
      parsedFeatures = pkg.features;
    } else if (typeof pkg.features === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(pkg.features);
        parsedFeatures = Array.isArray(parsed) ? parsed : [pkg.features];
      } catch (error) {
        // If parsing fails, split by newlines or commas
        parsedFeatures = pkg.features
          .split(/[\n,]/)
          .map((feature: string) => feature.trim())
          .filter((feature: string) => feature.length > 0);
      }
    }
  }
  
  return {
    id: pkg.id || '',
    title: pkg.title || '',
    price: pkg.price || 0,
    monthlyPrice: pkg.monthlyPrice,
    shortDescription: pkg.shortDescription || pkg.title || '',
    fullDescription: pkg.fullDescription || pkg.shortDescription || '',
    features: parsedFeatures,
    popular: !!pkg.popular,
    setupFee: typeof pkg.setupFee === 'number' ? pkg.setupFee : 0,
    durationMonths: pkg.durationMonths || 12,
    termsAndConditions: pkg.termsAndConditions,
    type: pkg.type || 'Business',
    billingCycle: pkg.billingCycle,
    advancePaymentMonths: pkg.advancePaymentMonths,
    paymentType: pkg.paymentType || 'recurring',
    dashboardSections: pkg.dashboardSections || []
  };
};
