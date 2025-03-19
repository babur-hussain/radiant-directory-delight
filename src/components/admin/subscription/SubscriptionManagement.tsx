
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { fetchSubscriptionPackages, saveSubscriptionPackage, deleteSubscriptionPackage, isServerRunning } from '@/api/mongoAPI';
import CentralizedSubscriptionManager from './CentralizedSubscriptionManager';
import SubscriptionLoader from './SubscriptionLoader';
import SubscriptionError from './SubscriptionError';

interface SubscriptionManagementProps {
  onPermissionError: (error: any) => void;
  dbInitialized: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'offline';
  onRetryConnection?: () => void;
}

// Fallback packages to use when offline
const fallbackPackages: ISubscriptionPackage[] = [
  {
    id: "business-standard-fallback",
    name: "Business Standard",
    title: "Business Standard",
    description: "Standard business package with essential features",
    shortDescription: "Essential features for businesses",
    price: 9999,
    type: "Business",
    duration: 12,
    durationMonths: 12,
    features: ["Business profile", "Basic analytics", "Email support"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentType: "recurring",
    billingCycle: "yearly",
    isPopular: false
  },
  {
    id: "business-premium-fallback",
    name: "Business Premium",
    title: "Business Premium",
    description: "Premium business package with advanced features",
    shortDescription: "Advanced features for growing businesses",
    price: 19999,
    type: "Business",
    duration: 12,
    durationMonths: 12,
    features: ["Everything in Standard", "Priority listing", "Advanced analytics", "Priority support"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentType: "recurring",
    billingCycle: "yearly",
    isPopular: true
  }
];

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  onPermissionError,
  dbInitialized,
  connectionStatus,
  onRetryConnection
}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [error, setError] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(connectionStatus === 'offline' || connectionStatus === 'error');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Check connection status first
    if (connectionStatus === 'offline' || connectionStatus === 'error') {
      console.log("Using fallback packages due to connection status:", connectionStatus);
      setPackages(fallbackPackages);
      setIsOffline(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // First check if the server is running
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log("Server not available, using fallback packages");
        setPackages(fallbackPackages);
        setIsOffline(true);
        setIsLoading(false);
        return;
      }
      
      // If server is running, attempt to fetch real data
      const data = await fetchSubscriptionPackages();
      if (data && data.length > 0) {
        setPackages(data);
        setIsOffline(false);
      } else {
        console.log("No packages found, using fallback packages");
        setPackages(fallbackPackages);
        setIsOffline(true);
      }
    } catch (err) {
      console.error("Error fetching subscription packages:", err);
      setError(err);
      onPermissionError(err);
      setPackages(fallbackPackages);
      setIsOffline(true);
      
      toast({
        title: "Using offline mode",
        description: "Unable to connect to the server. Using cached data.",
        variant: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onPermissionError, toast, connectionStatus]);

  useEffect(() => {
    if (dbInitialized) {
      fetchData();
    }
  }, [fetchData, dbInitialized]);

  const handleSave = async (packageData: ISubscriptionPackage) => {
    try {
      if (isOffline) {
        toast({
          title: "Offline mode",
          description: "Changes can't be saved while offline. Please connect to the server first.",
          variant: "warning",
        });
        throw new Error("Cannot save changes while offline");
      }
      
      // Only include createdAt if it's a new package and doesn't already have one
      const packageToSave: ISubscriptionPackage = {
        ...packageData,
        updatedAt: new Date(),
      };
      
      // If it's a new package and doesn't have createdAt, add it
      if (!packageData.id && !packageData.createdAt) {
        packageToSave.createdAt = new Date();
      }
      
      const savedPackage = await saveSubscriptionPackage(packageToSave);
      
      // Update the packages list
      if (packageData.id) {
        setPackages(packages.map(p => p.id === packageData.id ? savedPackage : p));
      } else {
        setPackages([...packages, savedPackage]);
      }
      
      toast({
        title: packageData.id ? "Package updated" : "Package created",
        description: `Subscription package ${packageData.id ? "updated" : "created"} successfully.`,
      });
      
      return savedPackage;
    } catch (err) {
      console.error("Error saving subscription package:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to save package",
        description: "Failed to save subscription package. Check console for details.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleDelete = async (packageId: string) => {
    try {
      if (isOffline) {
        toast({
          title: "Offline mode",
          description: "Changes can't be saved while offline. Please connect to the server first.",
          variant: "warning",
        });
        throw new Error("Cannot delete packages while offline");
      }
      
      await deleteSubscriptionPackage(packageId);
      setPackages(packages.filter(p => p.id !== packageId));
      toast({
        title: "Package deleted",
        description: "Subscription package deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting subscription package:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to delete package",
        description: "Failed to delete subscription package. Check console for details.",
        variant: "destructive",
      });
      throw err;
    }
  };

  if (isLoading) {
    return <SubscriptionLoader 
      isLoading={true} 
      connectionStatus={connectionStatus}
      onRetry={onRetryConnection}
    />;
  }

  return (
    <div>
      {isOffline && (
        <div className="mb-4">
          <SubscriptionError 
            error="Operating in offline mode. Some features may be limited." 
            errorDetails={error ? (error.message || String(error)) : null}
            onRetry={onRetryConnection}
          />
        </div>
      )}
      
      <CentralizedSubscriptionManager 
        packages={packages}
        onSave={handleSave}
        onDelete={handleDelete}
        isOffline={isOffline}
      />
    </div>
  );
};

export default SubscriptionManagement;
