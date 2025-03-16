
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { initializeMongoDB } from '@/utils/initMongoDB';
import { initializeBusinessesInMongoDB } from '@/utils/businessInitialization';
import { importUsersToMongoDB } from '@/utils/userInitialization';
import { Database, Server } from 'lucide-react';

const MongoDBInitializationPanel: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [results, setResults] = useState({
    mongoConnected: false,
    businessesLoaded: 0,
    usersLoaded: 0,
    errors: [] as string[]
  });

  const handleInitialization = async () => {
    setStatus('processing');
    setProgress(0);
    setCurrentTask('Connecting to MongoDB');
    setResults({
      mongoConnected: false,
      businessesLoaded: 0,
      usersLoaded: 0,
      errors: []
    });

    try {
      // Step 1: Initialize MongoDB connection (10%)
      setProgress(5);
      const connected = await initializeMongoDB();
      setProgress(10);
      setResults(prev => ({ ...prev, mongoConnected: connected }));
      
      if (!connected) {
        throw new Error('Failed to connect to MongoDB');
      }

      // Step 2: Initialize businesses (45%)
      setCurrentTask('Loading businesses data');
      setProgress(15);
      const businessResult = await initializeBusinessesInMongoDB((loadProgress) => {
        setProgress(15 + loadProgress * 30);
      });
      setProgress(45);
      setResults(prev => ({ ...prev, businessesLoaded: businessResult.loaded }));

      // Step 3: Initialize users (45%)
      setCurrentTask('Loading users data');
      setProgress(50);
      const userResult = await importUsersToMongoDB((loadProgress) => {
        setProgress(50 + loadProgress * 40);
      });
      setProgress(90);
      setResults(prev => ({ ...prev, usersLoaded: userResult.loaded }));

      // Complete
      setProgress(100);
      setStatus('completed');
      setCurrentTask('Initialization complete');
    } catch (error) {
      console.error('Error during MongoDB initialization:', error);
      setStatus('error');
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error occurred']
      }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">MongoDB Initialization</CardTitle>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">→</span>
            <Server className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardDescription>
          Initialize MongoDB with data from your application. This will load businesses, users, and subscription data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'idle' && (
          <Alert>
            <AlertTitle>Ready to initialize</AlertTitle>
            <AlertDescription>
              MongoDB initialization will load data from your application into MongoDB. 
              This is useful if you're starting with a fresh MongoDB instance.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'processing' && (
          <>
            <Alert>
              <AlertTitle>Initialization in progress</AlertTitle>
              <AlertDescription>
                {currentTask}. Please do not close this window.
              </AlertDescription>
            </Alert>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </>
        )}
        
        {status === 'completed' && (
          <Alert variant="default">
            <AlertTitle>Initialization completed</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p><strong>MongoDB Connection:</strong> {results.mongoConnected ? 'Successful' : 'Failed'}</p>
                <p><strong>Businesses Loaded:</strong> {results.businessesLoaded}</p>
                <p><strong>Users Loaded:</strong> {results.usersLoaded}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Initialization failed</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                {results.errors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleInitialization}
          disabled={status === 'processing'}
          className="w-full"
        >
          {status === 'idle' ? 'Initialize MongoDB' : 
           status === 'processing' ? 'Initializing...' : 
           status === 'completed' ? 'Initialize Again' : 'Retry Initialization'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MongoDBInitializationPanel;
