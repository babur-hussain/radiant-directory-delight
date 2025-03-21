
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, RefreshCw, Check, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { seedDummyUsers, seedDummyBusinesses, seedDummySubscriptionPackages, seedDummySubscriptions, seedAllDummyData } from '@/utils/seedDummyData';

export interface SeedDataPanelProps {
  dbInitialized: boolean;
  connectionStatus: string;
  onPermissionError?: (error: any) => void;
  onRetryConnection?: () => void;
}

const SeedDataPanel: React.FC<SeedDataPanelProps> = ({ 
  dbInitialized, 
  connectionStatus,
  onPermissionError,
  onRetryConnection
}) => {
  const [isSeedingUsers, setIsSeedingUsers] = useState(false);
  const [isSeedingBusinesses, setIsSeedingBusinesses] = useState(false);
  const [isSeedingPackages, setIsSeedingPackages] = useState(false);
  const [isSeedingSubscriptions, setIsSeedingSubscriptions] = useState(false);
  const [isSeedingAll, setIsSeedingAll] = useState(false);
  
  const isSeeding = isSeedingUsers || isSeedingBusinesses || isSeedingPackages || isSeedingSubscriptions || isSeedingAll;
  
  const handleSeedUsers = async () => {
    try {
      setIsSeedingUsers(true);
      const result = await seedDummyUsers();
      if (result.success) {
        // Success handling
      } else {
        onPermissionError?.(result.error);
      }
    } catch (error) {
      onPermissionError?.(error);
    } finally {
      setIsSeedingUsers(false);
    }
  };
  
  const handleSeedBusinesses = async () => {
    try {
      setIsSeedingBusinesses(true);
      const result = await seedDummyBusinesses();
      if (result.success) {
        // Success handling
      } else {
        onPermissionError?.(result.error);
      }
    } catch (error) {
      onPermissionError?.(error);
    } finally {
      setIsSeedingBusinesses(false);
    }
  };
  
  const handleSeedPackages = async () => {
    try {
      setIsSeedingPackages(true);
      const result = await seedDummySubscriptionPackages();
      if (result.success) {
        // Success handling
      } else {
        onPermissionError?.(result.error);
      }
    } catch (error) {
      onPermissionError?.(error);
    } finally {
      setIsSeedingPackages(false);
    }
  };
  
  const handleSeedSubscriptions = async () => {
    try {
      setIsSeedingSubscriptions(true);
      const result = await seedDummySubscriptions();
      if (result.success) {
        // Success handling
      } else {
        onPermissionError?.(result.error);
      }
    } catch (error) {
      onPermissionError?.(error);
    } finally {
      setIsSeedingSubscriptions(false);
    }
  };
  
  const handleSeedAll = async () => {
    try {
      setIsSeedingAll(true);
      const result = await seedAllDummyData();
      if (result.success) {
        // Success handling
      } else {
        onPermissionError?.(result.results);
      }
    } catch (error) {
      onPermissionError?.(error);
    } finally {
      setIsSeedingAll(false);
    }
  };
  
  // If not connected, show error
  if (connectionStatus === 'error') {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Cannot connect to the database. Please check your configuration.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={onRetryConnection} disabled={isSeeding}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If database is not initialized, show error
  if (!dbInitialized) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Database Not Initialized</AlertTitle>
            <AlertDescription>
              The database structure has not been initialized yet. Please run the setup script.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={onRetryConnection} disabled={isSeeding}>
              <Database className="h-4 w-4 mr-2" />
              Initialize Database
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Data</CardTitle>
        <CardDescription>
          Populate your database with sample data for testing and development purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>
                  Add sample users with different roles
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSeedUsers}
                  disabled={isSeeding}
                >
                  {isSeedingUsers ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Seed Users
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Businesses</CardTitle>
                <CardDescription>
                  Add sample business listings
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSeedBusinesses}
                  disabled={isSeeding}
                >
                  {isSeedingBusinesses ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Seed Businesses
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Subscription Packages</CardTitle>
                <CardDescription>
                  Add sample subscription plans
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSeedPackages}
                  disabled={isSeeding}
                >
                  {isSeedingPackages ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Seed Packages
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Subscriptions</CardTitle>
                <CardDescription>
                  Add sample user subscriptions
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSeedSubscriptions}
                  disabled={isSeeding}
                >
                  {isSeedingSubscriptions ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Seed Subscriptions
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">All Sample Data</CardTitle>
              <CardDescription>
                Add all types of sample data at once
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between gap-4">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={handleSeedAll}
                disabled={isSeeding}
              >
                {isSeedingAll ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Seed All Data
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full" 
                disabled={true} // Disabled for safety
              >
                <Trash className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeedDataPanel;
