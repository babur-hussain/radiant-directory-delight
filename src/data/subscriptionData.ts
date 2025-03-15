
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
}

// Default business subscription packages (used as fallback if Firebase fetch fails)
export const businessPackages: SubscriptionPackage[] = [
  {
    id: "business-basic",
    title: "Basic Business",
    price: 999,
    monthlyPrice: 99,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "Perfect for small businesses just starting out",
    fullDescription: "Our Basic Business plan provides all the essential tools you need to establish your online presence and connect with influencers. Ideal for small businesses and startups.",
    features: [
      "Connect with up to 5 influencers",
      "Basic analytics dashboard",
      "Standard customer support",
      "Basic campaign management"
    ],
    popular: false,
    type: "Business",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "business-standard",
    title: "Standard Business",
    price: 1999,
    monthlyPrice: 199,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "The ideal choice for growing businesses",
    fullDescription: "The Standard Business plan provides enhanced features to help your business grow. Connect with more influencers and gain access to advanced analytics and priority support.",
    features: [
      "Connect with up to 15 influencers",
      "Advanced analytics",
      "Priority customer support",
      "Campaign management tools",
      "Monthly performance reports"
    ],
    popular: true,
    type: "Business",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "business-premium",
    title: "Premium Business",
    price: 3999,
    monthlyPrice: 399,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "Advanced features for established businesses",
    fullDescription: "Our Premium Business plan offers comprehensive tools and features for established businesses looking to maximize their influencer marketing strategy.",
    features: [
      "Unlimited influencer connections",
      "Real-time analytics dashboard",
      "24/7 premium support",
      "Advanced campaign management",
      "Competitor analysis tools",
      "Custom monthly reports"
    ],
    popular: false,
    type: "Business",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "business-enterprise",
    title: "Enterprise",
    price: 7999,
    monthlyPrice: 799,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "Custom solutions for large businesses",
    fullDescription: "The Enterprise plan is designed for large businesses with complex needs. Get a customized solution with dedicated account management and all premium features.",
    features: [
      "Unlimited influencer connections",
      "Enterprise-grade analytics",
      "Dedicated account manager",
      "White-label reporting",
      "API access",
      "Custom integrations",
      "Strategic consulting"
    ],
    popular: false,
    type: "Business",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  }
];

// Default influencer subscription packages (used as fallback if Firebase fetch fails)
export const influencerPackages: SubscriptionPackage[] = [
  {
    id: "influencer-starter",
    title: "Influencer Starter",
    price: 999,
    monthlyPrice: 99,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "Perfect for new influencers",
    fullDescription: "The Influencer Starter plan provides all the basic tools you need to kickstart your influencer career and connect with businesses.",
    features: [
      "Create a professional profile",
      "Connect with up to 10 businesses",
      "Basic analytics dashboard",
      "Standard support"
    ],
    popular: false,
    type: "Influencer",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "influencer-growth",
    title: "Influencer Growth",
    price: 1599,
    monthlyPrice: 159,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "Ideal for growing your influence",
    fullDescription: "The Growth plan helps you expand your reach and connect with more businesses, while providing better tools to track your performance.",
    features: [
      "Enhanced professional profile",
      "Connect with up to 25 businesses",
      "Advanced analytics dashboard",
      "Priority support",
      "Campaign performance tools",
      "Collaboration recommendations"
    ],
    popular: true,
    type: "Influencer",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "influencer-pro",
    title: "Influencer Pro",
    price: 2999,
    monthlyPrice: 299,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "For established influencers",
    fullDescription: "The Pro plan is designed for established influencers who want to maximize their earnings and professional relationships with business partners.",
    features: [
      "Premium profile customization",
      "Unlimited business connections",
      "Comprehensive analytics",
      "Priority support with dedicated manager",
      "Advanced collaboration tools",
      "Performance insights",
      "Early access to new businesses"
    ],
    popular: false,
    type: "Influencer",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  },
  {
    id: "influencer-elite",
    title: "Influencer Elite",
    price: 4999,
    monthlyPrice: 499,
    setupFee: 20,
    durationMonths: 12,
    shortDescription: "For professional influencers",
    fullDescription: "The Elite plan offers the most comprehensive set of tools for professional influencers who need the best resources for managing their brand and business relationships.",
    features: [
      "Ultimate profile customization",
      "Unlimited business connections",
      "Real-time analytics and insights",
      "24/7 VIP support",
      "Content performance analysis",
      "Audience insights tools",
      "Exclusive events and networking",
      "Personalized growth consultation"
    ],
    popular: false,
    type: "Influencer",
    billingCycle: "yearly",
    advancePaymentMonths: 0
  }
];

// Function to get package by ID
export const getPackageById = (packageId: string, packages?: SubscriptionPackage[]): SubscriptionPackage | undefined => {
  if (packages) {
    return packages.find(pkg => pkg.id === packageId);
  }
  return [...businessPackages, ...influencerPackages].find(pkg => pkg.id === packageId);
};
