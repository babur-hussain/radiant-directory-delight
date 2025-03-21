
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { migrateUsersFromFirestore, migrateSubscriptionsFromFirestore, migrateBusinessesFromFirestore } from '@/utils/firestore-to-mongodb-migration';
import { AlertCircle } from 'lucide-react';

const MigrationUtility: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [currentCollection, setCurrentCollection] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<{
    users: { success: number; failed: number };
    subscriptions: { success: number; failed: number };
    businesses: { success: number; failed: number };
  }>({
    users: { success: 0, failed: 0 },
    subscriptions: { success: 0, failed: 0 },
    businesses: { success: 0, failed: 0 },
  });
  const [error, setError] = useState<string | null>(null);

  const startMigration = async () => {
    setMigrationStatus('processing');
    setError(null);
    setProgress(0);
    
    try {
      // Migrate users
      setCurrentCollection('users');
      setProgress(10);
      const userResults = await migrateUsersFromFirestore((progress) => {
        setProgress(10 + progress * 0.3);
      });
      setResults(prev => ({...prev, users: userResults}));
      
      // Migrate subscriptions
      setCurrentCollection('subscriptions');
      setProgress(40);
      const subscriptionResults = await migrateSubscriptionsFromFirestore((progress) => {
        setProgress(40 + progress * 0.3);
      });
      setResults(prev => ({...prev, subscriptions: subscriptionResults}));
      
      // Migrate businesses
      setCurrentCollection('businesses');
      setProgress(70);
      const businessResults = await migrateBusinessesFromFirestore((progress) => {
        setProgress(70 + progress * 0.3);
      });
      setResults(prev => ({...prev, businesses: businessResults}));
      
      setProgress(100);
      setMigrationStatus('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during migration');
      setMigrationStatus('error');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Firestore to Supabase Migration Utility</CardTitle>
        <CardDescription>
          Migrate all your data from Firestore to Supabase for improved performance and scalability.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Firebase Removed</AlertTitle>
          <AlertDescription>
            Firebase has been removed from this application. This migration utility is now 
            provided only for backward compatibility. The application now uses Supabase exclusively.
          </AlertDescription>
        </Alert>
        
        {migrationStatus === 'idle' && (
          <Alert>
            <AlertTitle>Ready to migrate</AlertTitle>
            <AlertDescription>
              Click the button below to start the migration process. This may take several minutes depending on the
              amount of data.
            </AlertDescription>
          </Alert>
        )}
        
        {migrationStatus === 'processing' && (
          <>
            <Alert>
              <AlertTitle>Migration in progress</AlertTitle>
              <AlertDescription>
                Currently migrating {currentCollection}. Please do not close this window.
              </AlertDescription>
            </Alert>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </>
        )}
        
        {migrationStatus === 'completed' && (
          <Alert variant="default">
            <AlertTitle>Migration completed</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p><strong>Users:</strong> {results.users.success} migrated, {results.users.failed} failed</p>
                <p><strong>Subscriptions:</strong> {results.subscriptions.success} migrated, {results.subscriptions.failed} failed</p>
                <p><strong>Businesses:</strong> {results.businesses.success} migrated, {results.businesses.failed} failed</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {migrationStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Migration failed</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={startMigration}
          disabled={migrationStatus === 'processing'}
          className="w-full"
        >
          {migrationStatus === 'idle' ? 'Start Migration' : 
           migrationStatus === 'processing' ? 'Migration in Progress...' : 
           migrationStatus === 'completed' ? 'Run Migration Again' : 'Retry Migration'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MigrationUtility;
