
import { useState, useEffect } from 'react';
import { fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { SubscriptionPackage, convertToSubscriptionPackage } from '@/data/subscriptionData';
import { UserRole } from '@/contexts/AuthContext';
import { isServerRunning } from '@/api/mongoAPI';

// Default fallback packages for when MongoDB is offline
const fallbackBusinessPackages = [
  {
    id: "business-basic-fallback",
    title: "Basic Business",
    price: 9999,
    shortDescription: "Essential tools for small businesses",
    fullDescription: "Get started with the essential tools every small business needs to establish an online presence.",
    features: ["Business profile listing", "Basic analytics", "Email support"],
    popular: false,
    setupFee: 1999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring",
    billingCycle: "yearly"
  },
  {
    id: "business-pro-fallback",
    title: "Business Pro",
    price: 19999,
    shortDescription: "Advanced tools for growing businesses",
    fullDescription: "Comprehensive tools and features for businesses looking to expand their reach and customer base.",
    features: ["Everything in Basic", "Priority business listing", "Advanced analytics", "Priority support"],
    popular: true,
    setupFee: 999,
    durationMonths: 12,
    type: "Business",
    paymentType: "recurring",
    billingCycle: "yearly"
  }
];

const fallbackInfluencerPackages = [
  {
    id: "influencer-starter-fallback",
    title: "Influencer Starter",
    price: 4999,
    shortDescription: "Essential tools for new influencers",
    fullDescription: "Get started with the essential tools every influencer needs to connect with businesses.",
    features: ["Influencer profile listing", "Basic analytics"],
    popular: false,
    setupFee: 999,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring",
    billingCycle: "yearly"
  },
  {
    id: "influencer-pro-fallback",
    title: "Influencer Pro",
    price: 9999,
    shortDescription: "Advanced tools for serious influencers",
    fullDescription: "Comprehensive tools and features for influencers looking to monetize their audience.",
    features: ["Everything in Starter", "Priority profile listing", "Advanced analytics"],
    popular: true,
    setupFee: 499,
    durationMonths: 12,
    type: "Influencer",
    paymentType: "recurring",
    billingCycle: "yearly"
  }
];

export const useSubscriptionPackages = (userRole: UserRole | string) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading subscription packages for role: ${userRole}`);
        
        // First check if the server is running
        const serverAvailable = await isServerRunning();
        
        if (!serverAvailable) {
          console.log("Server is not available, using fallback data");
          setIsOffline(true);
          
          // Convert userRole to appropriate type
          const type = userRole === 'Admin' 
            ? 'Business' 
            : userRole === 'Influencer' 
              ? 'Influencer' 
              : 'Business';
          
          // Select the appropriate fallback data
          const fallbackData = type === 'Business' 
            ? fallbackBusinessPackages 
            : fallbackInfluencerPackages;
          
          // Convert to SubscriptionPackage type
          const convertedPackages = fallbackData.map(pkg => convertToSubscriptionPackage(pkg));
          console.log(`Using ${convertedPackages.length} fallback ${type} packages`);
          setPackages(convertedPackages);
          setIsLoading(false);
          return;
        }
        
        // Convert userRole to appropriate type format for API
        // For business page, we need to ensure it always passes "Business" as the type
        const type = userRole === 'Admin' 
          ? 'Business' 
          : userRole === 'Influencer' 
            ? 'Influencer' 
            : 'Business';
        
        console.log(`Fetching packages for type: ${type}`);
        const fetchedPackages = await fetchSubscriptionPackagesByType(type as "Business" | "Influencer");
        console.log(`Fetched ${fetchedPackages.length} ${type} packages:`, fetchedPackages);
        
        if (!fetchedPackages || fetchedPackages.length === 0) {
          console.log(`No ${type} packages found`);
          setPackages([]);
        } else {
          // Convert to SubscriptionPackage type
          const convertedPackages = fetchedPackages.map(pkg => convertToSubscriptionPackage(pkg));
          console.log('Converted packages:', convertedPackages);
          setPackages(convertedPackages);
        }
      } catch (err) {
        console.error('Error loading subscription packages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription packages');
        
        // Use fallback data if there's an error
        console.log("Error occurred, using fallback data");
        setIsOffline(true);
        
        // Convert userRole to appropriate type
        const type = userRole === 'Admin' 
          ? 'Business' 
          : userRole === 'Influencer' 
            ? 'Influencer' 
            : 'Business';
        
        // Select the appropriate fallback data
        const fallbackData = type === 'Business' 
          ? fallbackBusinessPackages 
          : fallbackInfluencerPackages;
        
        // Convert to SubscriptionPackage type
        const convertedPackages = fallbackData.map(pkg => convertToSubscriptionPackage(pkg));
        console.log(`Using ${convertedPackages.length} fallback ${type} packages due to error`);
        setPackages(convertedPackages);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [userRole]);

  return { packages, isLoading, error, isOffline };
};
