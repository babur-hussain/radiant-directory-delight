
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubscriptionPackageForm from './SubscriptionPackageForm';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionPermissionError from './SubscriptionPermissionError';
import SubscriptionLoader from './SubscriptionLoader';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export interface SubscriptionPackageManagementProps {
  onPermissionError: (error: any) => void;
  dbInitialized?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
  onRetryConnection?: () => void;
}

const SubscriptionPackageManagement: React.FC<SubscriptionPackageManagementProps> = ({
  onPermissionError,
  dbInitialized = true,
  connectionStatus = 'connected',
  onRetryConnection
}) => {
  const [activeTab, setActiveTab] = useState<string>('business');
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  
  const {
    packages = [],
    isLoading,
    error,
    isOffline,
    offlineMode,
    fetchPackages,
    addOrUpdatePackage,
    removePackage
  } = useSubscriptionPackages({});

  // Safety check to ensure packages is always an array
  const safePackages = Array.isArray(packages) ? packages : [];
  
  // Safely filter packages
  const businessPackages = safePackages.filter(pkg => pkg && pkg.type === 'Business');
  const influencerPackages = safePackages.filter(pkg => pkg && pkg.type === 'Influencer');

  const handleSavePackage = async (packageData: ISubscriptionPackage) => {
    try {
      console.log('Handling save package:', packageData);
      
      if (!packageData) {
        throw new Error("Package data is required");
      }
      
      // Ensure package type is set based on active tab if not provided
      if (!packageData.type) {
        packageData.type = activeTab === 'business' ? 'Business' : 'Influencer';
      }
      
      await addOrUpdatePackage(packageData);
      setSelectedPackage(null);
      await fetchPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      onPermissionError(err);
    }
  };

  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      await removePackage(packageId);
      await fetchPackages();
    } catch (err) {
      console.error('Error deleting package:', err);
      onPermissionError(err);
    }
  };

  const handleCreatePackage = () => {
    const newPackage: ISubscriptionPackage = {
      id: '',
      title: 'Untitled Package',
      type: activeTab === 'business' ? 'Business' : 'Influencer',
      price: 999,
      setupFee: 0,
      billingCycle: 'yearly',
      features: [],
      shortDescription: '',
      fullDescription: '',
      durationMonths: 12,
      advancePaymentMonths: 0,
      paymentType: 'recurring',
      popular: false,
      isActive: true,
      maxBusinesses: 1,
      maxInfluencers: 1
    };
    
    setSelectedPackage(newPackage);
  };

  const handleCancelEdit = () => {
    setSelectedPackage(null);
  };

  const handleRetryConnection = () => {
    fetchPackages();
    if (onRetryConnection) onRetryConnection();
  };

  if (error && !isOffline) {
    return <SubscriptionPermissionError error={error} onRetry={handleRetryConnection} />;
  }

  const effectiveConnectionStatus = connectionStatus || (isOffline ? 'offline' : 'connected');
  const currentPackages = activeTab === 'business' ? businessPackages : influencerPackages;

  return (
    <div className="space-y-6">
      {effectiveConnectionStatus === 'offline' && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>MongoDB server is not available. Operating in offline mode with limited functionality.</p>
            <p>You can still view and modify subscription packages, but changes will only be stored locally until a connection is established.</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={handleRetryConnection}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try to reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {effectiveConnectionStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Failed to connect to MongoDB. Using locally cached data.</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={handleRetryConnection}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Subscription Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="influencer">Influencer</TabsTrigger>
              </TabsList>
              
              <Button onClick={handleCreatePackage}>
                Create New Package
              </Button>
            </div>

            <SubscriptionLoader 
              isLoading={isLoading} 
              connectionStatus={effectiveConnectionStatus} 
              onRetry={handleRetryConnection} 
            />

            <TabsContent value="business" className="mt-0">
              {!isLoading && (
                <div className="space-y-6">
                  {selectedPackage && selectedPackage.type === 'Business' ? (
                    <SubscriptionPackageForm 
                      package={selectedPackage} 
                      onSave={handleSavePackage}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {businessPackages.map((pkg) => (
                        <div key={pkg.id} className="border rounded-lg p-4 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{pkg.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{pkg.shortDescription}</p>
                              <div className="mt-2">
                                <span className="font-medium">₹{pkg.price}</span>
                                <span className="text-sm text-muted-foreground"> / {pkg.billingCycle || 'year'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditPackage(pkg)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="influencer" className="mt-0">
              {!isLoading && (
                <div className="space-y-6">
                  {selectedPackage && selectedPackage.type === 'Influencer' ? (
                    <SubscriptionPackageForm 
                      package={selectedPackage} 
                      onSave={handleSavePackage}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {influencerPackages.map((pkg) => (
                        <div key={pkg.id} className="border rounded-lg p-4 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{pkg.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{pkg.shortDescription}</p>
                              <div className="mt-2">
                                <span className="font-medium">₹{pkg.price}</span>
                                <span className="text-sm text-muted-foreground"> / {pkg.billingCycle || 'year'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditPackage(pkg)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPackageManagement;
