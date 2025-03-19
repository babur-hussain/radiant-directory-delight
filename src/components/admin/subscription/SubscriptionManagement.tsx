
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { fetchSubscriptionPackages, saveSubscriptionPackage, deleteSubscriptionPackage } from '@/api/mongoAPI';
import CentralizedSubscriptionManager from './CentralizedSubscriptionManager';

interface SubscriptionManagementProps {
  onPermissionError: (error: any) => void;
  dbInitialized: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'offline';
  onRetryConnection?: () => void;
}

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptionPackages();
      setPackages(data);
    } catch (err) {
      console.error("Error fetching subscription packages:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to load packages",
        description: "Failed to load subscription packages. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onPermissionError, toast]);

  useEffect(() => {
    if (dbInitialized) {
      fetchData();
    }
  }, [fetchData, dbInitialized]);

  const handleSave = async (packageData: ISubscriptionPackage) => {
    try {
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
    return <div>Loading subscription packages...</div>;
  }

  return (
    <div>
      <CentralizedSubscriptionManager 
        packages={packages}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SubscriptionManagement;
