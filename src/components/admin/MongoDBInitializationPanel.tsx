
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, Server } from 'lucide-react';
import { setupMongoDB } from '@/utils/setupMongoDB';

const MongoDBInitializationPanel: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [results, setResults] = useState({
    mongoConnected: false,
    collectionsSetup: [] as string[],
    errors: [] as string[]
  });

  const handleInitialization = async () => {
    setStatus('processing');
    setProgress(0);
    setCurrentTask('Setting up MongoDB collections');
    setResults({
      mongoConnected: false,
      collectionsSetup: [],
      errors: []
    });

    try {
      // Initialize MongoDB collections
      const setupResult = await setupMongoDB((progressValue, message) => {
        setProgress(progressValue);
        setCurrentTask(message);
      });
      
      setResults(prev => ({
        ...prev,
        mongoConnected: true,
        collectionsSetup: setupResult.collections
      }));
      
      // Complete
      setProgress(100);
      setStatus('completed');
      setCurrentTask('MongoDB setup complete');
    } catch (error) {
      console.error('Error during MongoDB setup:', error);
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
          <CardTitle className="text-xl font-bold">MongoDB Setup</CardTitle>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">→</span>
            <Server className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardDescription>
          Set up MongoDB collections and schema without migrating data. This will prepare your database for fresh data entry.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'idle' && (
          <Alert>
            <AlertTitle>Ready to setup MongoDB</AlertTitle>
            <AlertDescription>
              This will create all the necessary collections and schema in MongoDB without migrating any data.
              You can then manually upload your business CSV and create subscription packages.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'processing' && (
          <>
            <Alert>
              <AlertTitle>Setup in progress</AlertTitle>
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
            <AlertTitle>Setup completed</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p><strong>MongoDB Connection:</strong> {results.mongoConnected ? 'Successful' : 'Failed'}</p>
                <p><strong>Collections Setup:</strong> {results.collectionsSetup.join(', ')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You can now upload your business CSV and create subscription packages.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Setup failed</AlertTitle>
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
          {status === 'idle' ? 'Setup MongoDB Collections' : 
           status === 'processing' ? 'Setting up...' : 
           status === 'completed' ? 'Run Setup Again' : 'Retry Setup'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MongoDBInitializationPanel;
