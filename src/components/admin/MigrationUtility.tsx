
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { migrateFirestoreToMongoDB } from '@/utils/firestore-to-mongodb-migration';
import { connectToMongoDB } from '@/config/mongodb';
import { Separator } from '@/components/ui/separator';

const MigrationUtility = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [migrationResults, setMigrationResults] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('idle');
    setConnectionMessage('');
    
    try {
      const connected = await connectToMongoDB();
      
      if (connected) {
        setConnectionStatus('success');
        setConnectionMessage('Successfully connected to MongoDB');
      } else {
        setConnectionStatus('error');
        setConnectionMessage('Failed to connect to MongoDB');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const startMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('running');
    setProgress(10);
    setErrorMessage('');
    
    try {
      // Run the migration process
      setProgress(20);
      
      // Simulate progress while the migration runs
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);
      
      // Run the actual migration
      const result = await migrateFirestoreToMongoDB();
      
      clearInterval(progressInterval);
      
      if (result.success) {
        setMigrationStatus('success');
        setMigrationResults(result);
        setProgress(100);
      } else {
        setMigrationStatus('error');
        setErrorMessage(result.error || 'Unknown error during migration');
        setProgress(0);
      }
    } catch (error) {
      setMigrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setProgress(0);
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Firestore to MongoDB Migration Utility</CardTitle>
              <CardDescription>Migrate data from Firebase Firestore to MongoDB</CardDescription>
            </div>
            <Database className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">MongoDB Connection Status</h3>
              {connectionStatus === 'success' && (
                <span className="flex items-center text-green-500 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" /> Connected
                </span>
              )}
            </div>
            
            {connectionStatus === 'success' && (
              <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Connected</AlertTitle>
                <AlertDescription>{connectionMessage}</AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>{connectionMessage}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant="outline" 
              onClick={testConnection} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test MongoDB Connection'
              )}
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Migration Status</h3>
            
            {migrationStatus === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Migration in progress...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {migrationStatus === 'success' && (
              <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Migration Successful</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 text-sm">
                    <p><strong>Users:</strong> {migrationResults?.userCount || 0}</p>
                    <p><strong>Subscription Packages:</strong> {migrationResults?.packageCount || 0}</p>
                    <p><strong>Subscriptions:</strong> {migrationResults?.subscriptionCount || 0}</p>
                    <p><strong>Businesses:</strong> {migrationResults?.businessCount || 0}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {migrationStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Migration Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {migrationStatus !== 'running' && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  This process will migrate all data from Firestore to MongoDB. Make sure you have tested the connection 
                  first and have a backup of your Firestore data. This migration is irreversible.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={startMigration}
            disabled={isMigrating || connectionStatus !== 'success'}
            className="w-full"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrating Data...
              </>
            ) : (
              'Start Migration'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Migration Steps:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Test MongoDB connection to ensure connectivity.</li>
          <li>Backup your Firestore data (recommended).</li>
          <li>Start the migration process.</li>
          <li>After completion, verify data in MongoDB.</li>
          <li>Update your application to use MongoDB instead of Firestore.</li>
        </ol>
      </div>
    </div>
  );
};

export default MigrationUtility;
