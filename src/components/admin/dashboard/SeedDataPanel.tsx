
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, Users, Store, Package, Receipt, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { seedDummyUsers, seedDummyBusinesses, seedDummySubscriptionPackages, seedDummySubscriptions, seedAllDummyData } from '@/utils/seedDummyData';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const SeedDataPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingType, setIsLoadingType] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeedUsers = async () => {
    setIsLoading(true);
    setIsLoadingType('users');
    setError(null);
    setResult(null);
    
    try {
      const result = await seedDummyUsers(15);
      setResult(result);
      
      toast({
        title: result.success ? "Users Created" : "Operation Failed",
        description: result.success 
          ? `Successfully created ${result.count} dummy users` 
          : "Failed to create dummy users",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error Creating Users",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingType(null);
    }
  };

  const handleSeedBusinesses = async () => {
    setIsLoading(true);
    setIsLoadingType('businesses');
    setError(null);
    setResult(null);
    
    try {
      const result = await seedDummyBusinesses(20);
      setResult(result);
      
      toast({
        title: result.success ? "Businesses Created" : "Operation Failed",
        description: result.success 
          ? `Successfully created ${result.count} dummy businesses` 
          : "Failed to create dummy businesses",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error Creating Businesses",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingType(null);
    }
  };

  const handleSeedSubscriptionPackages = async () => {
    setIsLoading(true);
    setIsLoadingType('packages');
    setError(null);
    setResult(null);
    
    try {
      const result = await seedDummySubscriptionPackages();
      setResult(result);
      
      toast({
        title: result.success ? "Packages Created" : "Operation Failed",
        description: result.success 
          ? `Successfully created ${result.count} subscription packages` 
          : "Failed to create subscription packages",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error Creating Packages",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingType(null);
    }
  };

  const handleSeedSubscriptions = async () => {
    setIsLoading(true);
    setIsLoadingType('subscriptions');
    setError(null);
    setResult(null);
    
    try {
      const result = await seedDummySubscriptions(25);
      setResult(result);
      
      toast({
        title: result.success ? "Subscriptions Created" : "Operation Failed",
        description: result.success 
          ? `Successfully created ${result.count} dummy subscriptions` 
          : "Failed to create dummy subscriptions",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error Creating Subscriptions",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingType(null);
    }
  };

  const handleSeedAllData = async () => {
    setIsLoading(true);
    setIsLoadingType('all');
    setError(null);
    setResult(null);
    
    try {
      const result = await seedAllDummyData();
      setResult(result);
      
      toast({
        title: result.success ? "All Data Created" : "Operation Partially Failed",
        description: result.success 
          ? `Created ${result.users} users, ${result.businesses} businesses, ${result.packages} packages, ${result.subscriptions} subscriptions` 
          : "Some operations failed. See details in the panel.",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error Creating Data",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingType(null);
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seed Dummy Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Create dummy data for testing and development purposes. This will add random sample data to your database.
        </p>

        {isLoading && (
          <div className="space-y-2 my-4">
            <Progress value={70} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Creating {isLoadingType}... Please wait
            </p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && !error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Result</AlertTitle>
            <AlertDescription>
              {result.success ? (
                <div>
                  {result.count !== undefined && (
                    <p>Successfully created {result.count} items</p>
                  )}
                  {result.users !== undefined && (
                    <ul className="list-disc list-inside mt-2">
                      <li>Users: {result.users}</li>
                      <li>Businesses: {result.businesses}</li>
                      <li>Subscription Packages: {result.packages}</li>
                      <li>Subscriptions: {result.subscriptions}</li>
                    </ul>
                  )}
                </div>
              ) : (
                "Operation failed. Please check console for details."
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={handleSeedUsers} 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
            variant="outline"
          >
            {isLoadingType === 'users' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            Seed Users
          </Button>
          
          <Button 
            onClick={handleSeedBusinesses} 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
            variant="outline"
          >
            {isLoadingType === 'businesses' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Store className="h-4 w-4" />
            )}
            Seed Businesses
          </Button>
          
          <Button 
            onClick={handleSeedSubscriptionPackages} 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
            variant="outline"
          >
            {isLoadingType === 'packages' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            Seed Packages
          </Button>
          
          <Button 
            onClick={handleSeedSubscriptions} 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
            variant="outline"
          >
            {isLoadingType === 'subscriptions' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            Seed Subscriptions
          </Button>
        </div>
        
        <Button 
          onClick={handleSeedAllData} 
          className="w-full mt-4 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoadingType === 'all' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Seed All Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeedDataPanel;
