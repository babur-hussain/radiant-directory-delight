
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, RefreshCw, Check, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { seedDatabase } from '@/utils/seedDummyData';

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
  const [isSeedingAll, setIsSeedingAll] = useState(false);
  
  const handleSeedAll = async () => {
    try {
      setIsSeedingAll(true);
      const result = await seedDatabase();
      if (!result) {
        onPermissionError?.("Failed to seed database");
      }
    } catch (error) {
      console.error("Error seeding data:", error);
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
            <Button onClick={onRetryConnection}>
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
            <Button onClick={onRetryConnection}>
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
        <CardTitle>Database Management</CardTitle>
        <CardDescription>
          Manage your database for testing and development purposes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Operations on this page may affect your data. Use with caution in production environments.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Initialize Database</CardTitle>
            <CardDescription>
              Create initial database structure and seed minimal required data
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between gap-4 pt-2">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={handleSeedAll}
              disabled={isSeedingAll}
            >
              {isSeedingAll ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Initialize Database
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
      </CardContent>
    </Card>
  );
};

export default SeedDataPanel;
