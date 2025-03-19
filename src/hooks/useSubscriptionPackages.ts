
// This is a new file to define the useSubscriptionPackages hook
import { useState, useEffect } from 'react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export interface UseSubscriptionPackagesOptions {
  initialOfflineMode?: boolean;
  type?: string;
}

export const useSubscriptionPackages = (options: UseSubscriptionPackagesOptions = {}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [isOffline, setIsOffline] = useState<boolean>(options.initialOfflineMode || false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>(
    options.initialOfflineMode ? 'offline' : 'connecting'
  );

  // Function to retry connection
  const retryConnection = () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    // Mock fetching data - in a real app, this would connect to your API
    fetchPackages();
  };

  // Function to fetch packages
  const fetchPackages = async () => {
    try {
      // In a real app, this would be an API call
      // Mock data for now
      let mockPackages: ISubscriptionPackage[] = [
        {
          id: 'business-1',
          title: 'Business Basic',
          type: 'Business',
          price: 999,
          setupFee: 0,
          billingCycle: 'yearly',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          shortDescription: 'Basic plan for businesses',
          fullDescription: 'A basic plan for businesses with essential features.',
          durationMonths: 12,
          advancePaymentMonths: 0,
          paymentType: 'recurring',
          popular: false,
          isActive: true,
          maxBusinesses: 1,
          maxInfluencers: 1
        },
        {
          id: 'influencer-1',
          title: 'Influencer Basic',
          type: 'Influencer',
          price: 499,
          setupFee: 0,
          billingCycle: 'yearly',
          features: ['Feature 1', 'Feature 2'],
          shortDescription: 'Basic plan for influencers',
          fullDescription: 'A basic plan for influencers with essential features.',
          durationMonths: 12,
          advancePaymentMonths: 0,
          paymentType: 'recurring',
          popular: false,
          isActive: true,
          maxBusinesses: 0,
          maxInfluencers: 1
        }
      ];

      // Filter by type if provided
      if (options.type) {
        mockPackages = mockPackages.filter(pkg => pkg.type === options.type);
      }

      // Simulate some delay
      setTimeout(() => {
        setPackages(mockPackages);
        setIsLoading(false);
        setConnectionStatus('connected');
      }, 500); // Reduced delay for better UX
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err);
      setIsLoading(false);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [options.type]); // Re-fetch when type changes

  return {
    packages,
    isLoading,
    error,
    isOffline,
    connectionStatus,
    retryConnection
  };
};
