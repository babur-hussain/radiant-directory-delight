import { connectToMongoDB, mongoose } from '../config/mongodb';
import { ISubscriptionPackage, SubscriptionPackage } from '../models/SubscriptionPackage';
import { fetchSubscriptionPackages } from '@/lib/mongodb-utils';

// Add a browser compatibility check for process
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  // @ts-ignore - Add a minimal process polyfill for browser environments
  window.process = window.process || { env: {} };
}

// Default package templates for seeding if needed
const defaultBusinessPackages = [
  {
    id: "business-basic",
    title: "Basic Business",
    price: 9999,
    shortDescription: "Essential tools for small businesses",
    fullDescription: "Get started with the essential tools every small business needs to establish an online presence.",
    features: ["Business profile listing", "Basic analytics", "Email support"],
    popular: false,
    setupFee: 1999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring"
  },
  {
    id: "business-pro",
    title: "Business Pro",
    price: 19999,
    shortDescription: "Advanced tools for growing businesses",
    fullDescription: "Comprehensive tools and features for businesses looking to expand their reach and customer base.",
    features: ["Everything in Basic", "Priority business listing", "Advanced analytics", "Priority support", "Marketing toolkit"],
    popular: true,
    setupFee: 999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring"
  }
];

const defaultInfluencerPackages = [
  {
    id: "influencer-starter",
    title: "Influencer Starter",
    price: 4999,
    shortDescription: "Essential tools for new influencers",
    fullDescription: "Get started with the essential tools every influencer needs to connect with businesses.",
    features: ["Influencer profile listing", "Basic analytics", "Email support"],
    popular: false,
    setupFee: 999,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring"
  },
  {
    id: "influencer-pro",
    title: "Influencer Pro",
    price: 9999,
    shortDescription: "Advanced tools for serious influencers",
    fullDescription: "Comprehensive tools and features for influencers looking to monetize their audience and grow their brand.",
    features: ["Everything in Starter", "Priority profile listing", "Advanced analytics", "Priority support", "Brand partnership toolkit"],
    popular: true,
    setupFee: 499,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring"
  }
];

export const initializeMongoDB = async () => {
  try {
    console.log('Initializing MongoDB connection...');
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB during initialization');
      return false;
    }
    
    console.log('MongoDB connection established');
    
    // Seed default packages if none exist
    const packageCount = await SubscriptionPackage.countDocuments({});
    
    if (packageCount === 0) {
      console.log('No subscription packages found, seeding default packages...');
      
      // Combine business and influencer packages
      const allPackages = [...defaultBusinessPackages, ...defaultInfluencerPackages];
      
      // Add each package to MongoDB
      const seedPromises = allPackages.map(async (pkg) => {
        try {
          await SubscriptionPackage.create({
            ...pkg,
            features: pkg.features || []
          });
          console.log(`Seeded package: ${pkg.title}`);
        } catch (err) {
          console.error(`Error seeding package ${pkg.title}:`, err);
        }
      });
      
      await Promise.all(seedPromises);
      console.log('Default packages seeded successfully');
    } else {
      console.log(`Found ${packageCount} existing subscription packages, skipping seed`);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    return false;
  }
};
