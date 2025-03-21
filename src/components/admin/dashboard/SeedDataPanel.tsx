
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  seedDummyUsers, 
  seedDummyBusinesses, 
  seedDummySubscriptionPackages, 
  seedDummySubscriptions, 
  seedAllDummyData 
} from '@/utils/seedDummyData';

export interface SeedDataPanelProps {
  dbInitialized: boolean;
  connectionStatus: string;
  onRetryConnection?: () => void;
}

const SeedDataPanel: React.FC<SeedDataPanelProps> = ({ 
  dbInitialized, 
  connectionStatus,
  onRetryConnection
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');
  const { toast } = useToast();

  const handleSeedAll = async () => {
    setIsGenerating(true);
    setCurrentOperation('Seeding all data');
    
    try {
      const result = await seedAllDummyData();
      toast({
        title: 'Success',
        description: `Generated ${result.users.length} users, ${result.businesses.length} businesses, ${result.packages.length} packages, and ${result.subscriptions.length} subscriptions`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to seed data: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperation('');
    }
  };

  const handleSeedUsers = async () => {
    setIsGenerating(true);
    setCurrentOperation('Generating users');
    
    try {
      const users = await seedDummyUsers(5);
      toast({
        title: 'Success',
        description: `Generated ${users.length} test users`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate users: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperation('');
    }
  };

  const handleSeedBusinesses = async () => {
    setIsGenerating(true);
    setCurrentOperation('Generating businesses');
    
    try {
      const businesses = await seedDummyBusinesses(5);
      toast({
        title: 'Success',
        description: `Generated ${businesses.length} test businesses`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate businesses: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperation('');
    }
  };

  const handleSeedPackages = async () => {
    setIsGenerating(true);
    setCurrentOperation('Generating subscription packages');
    
    try {
      const packages = await seedDummySubscriptionPackages();
      toast({
        title: 'Success',
        description: `Generated ${packages.length} subscription packages`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate packages: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperation('');
    }
  };

  const handleSeedSubscriptions = async () => {
    setIsGenerating(true);
    setCurrentOperation('Generating subscriptions');
    
    try {
      const subscriptions = await seedDummySubscriptions(3);
      toast({
        title: 'Success',
        description: `Generated ${subscriptions.length} test subscriptions`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate subscriptions: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperation('');
    }
  };

  if (!dbInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seed Test Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Database is not initialized. Please initialize the database first.
          </p>
          {connectionStatus === 'error' && (
            <Button variant="secondary" onClick={onRetryConnection}>
              Retry Connection
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Test Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Generate test data for development and testing purposes.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleSeedAll}
              disabled={isGenerating}
            >
              {isGenerating && currentOperation === 'Seeding all data' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Seed All Data'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSeedUsers}
              disabled={isGenerating}
            >
              {isGenerating && currentOperation === 'Generating users' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Users'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSeedBusinesses}
              disabled={isGenerating}
            >
              {isGenerating && currentOperation === 'Generating businesses' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Businesses'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSeedPackages}
              disabled={isGenerating}
            >
              {isGenerating && currentOperation === 'Generating subscription packages' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Packages'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSeedSubscriptions}
              disabled={isGenerating}
              className="col-span-2"
            >
              {isGenerating && currentOperation === 'Generating subscriptions' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Subscriptions'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeedDataPanel;
