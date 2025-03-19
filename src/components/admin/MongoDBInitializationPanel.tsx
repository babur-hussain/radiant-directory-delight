import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, Server, Activity, RefreshCw, Info } from 'lucide-react';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { diagnoseMongoDbConnection, testConnectionWithRetry } from '@/utils/mongoDebug';
import { connectToMongoDB } from '@/config/mongodb';
import { isServerRunning } from '@/api/mongoAPI';

// Import API_BASE_URL from the mongoAPI file
import { API_BASE_URL } from '@/api/mongoAPI';

const MongoDBInitializationPanel: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [results, setResults] = useState({
    mongoConnected: false,
    collectionsSetup: [] as string[],
    errors: [] as string[]
  });
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check server status on component mount
    checkServerStatus();
    // Check connection status on component mount
    checkConnectionStatus();
  }, []);

  const checkServerStatus = async () => {
    const available = await isServerRunning();
    setServerAvailable(available);
  };

  const checkConnectionStatus = async () => {
    try {
      const connected = await connectToMongoDB();
      setResults(prev => ({
        ...prev,
        mongoConnected: connected
      }));
    } catch (error) {
      console.error('Error checking MongoDB connection:', error);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error occurred']
      }));
    }
  };

  const handleDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      await checkServerStatus();
      const diagnostics = await diagnoseMongoDbConnection();
      setDiagnosticResults(diagnostics);
    } catch (error) {
      console.error('Error running MongoDB diagnostics:', error);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Diagnostics failed']
      }));
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleInitialization = async () => {
    setStatus('processing');
    setProgress(0);
    setCurrentTask('Testing MongoDB connection');
    setResults({
      mongoConnected: false,
      collectionsSetup: [],
      errors: []
    });

    try {
      // Check if server is available
      const isAvailable = await isServerRunning();
      setServerAvailable(isAvailable);
      
      if (!isAvailable) {
        throw new Error('MongoDB server is not available. Please start the server or use local data.');
      }
      
      // First establish connection with retries
      setProgress(10);
      setCurrentTask('Establishing MongoDB connection');
      
      const connected = await testConnectionWithRetry(3, 2000);
      if (!connected) {
        throw new Error('Failed to connect to MongoDB after multiple attempts');
      }
      
      setProgress(30);
      setResults(prev => ({
        ...prev,
        mongoConnected: true
      }));
      
      // Initialize MongoDB collections
      setCurrentTask('Setting up MongoDB collections');
      const setupResult = await setupMongoDB((progressValue, message) => {
        setProgress(30 + (progressValue * 0.7)); // Scale to remaining 70%
        setCurrentTask(message);
      });
      
      setResults(prev => ({
        ...prev,
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
        {serverAvailable === false && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Server Not Available</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The MongoDB server at {API_BASE_URL} is not available.</p>
              <p>To use MongoDB features:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Start your server with <code>npm run server</code> in your project directory</li>
                <li>Ensure it's running on port 3001</li>
                <li>Check for any server-side errors in the console</li>
              </ul>
              <p className="mt-2">Until then, the application will use local fallback data.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiagnostics}
            disabled={isDiagnosing}
            className="flex items-center gap-2"
          >
            <Activity className={`h-4 w-4 ${isDiagnosing ? 'animate-pulse' : ''}`} />
            {isDiagnosing ? 'Running...' : 'Diagnose Connection'}
          </Button>
        </div>
        
        {diagnosticResults && (
          <Alert className="bg-blue-50 border-blue-200">
            <Activity className="h-4 w-4" />
            <AlertTitle>MongoDB Diagnostic Results</AlertTitle>
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p><strong>Environment:</strong> {diagnosticResults.environment}</p>
                <p><strong>Connection State:</strong> {diagnosticResults.connectionState}</p>
                <p><strong>URI:</strong> {diagnosticResults.uri}</p>
                <p><strong>Server Available:</strong> {serverAvailable ? 'Yes' : 'No'}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'idle' && (
          <Alert>
            <AlertTitle>Ready to setup MongoDB</AlertTitle>
            <AlertDescription>
              This will create all the necessary collections and schema in MongoDB without migrating any data.
              You can then manually upload your business CSV and create subscription packages.
              
              {results.mongoConnected ? (
                <p className="mt-2 text-green-600 font-medium">
                  MongoDB is currently connected.
                </p>
              ) : (
                <p className="mt-2 text-amber-600 font-medium">
                  MongoDB is currently not connected.
                </p>
              )}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkConnectionStatus}
                  className="mt-2 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Test Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleInitialization}
          disabled={status === 'processing' || serverAvailable === false}
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
