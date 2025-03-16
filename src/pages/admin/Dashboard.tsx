
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { autoInitMongoDB } from '@/utils/setupMongoDB';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Loading from '@/components/ui/loading';

const Dashboard = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [dbStatus, setDbStatus] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    // Initialize MongoDB when component mounts
    const initDb = async () => {
      setIsInitializing(true);
      try {
        await autoInitMongoDB();
        setDbStatus({
          success: true,
          message: 'MongoDB initialized successfully'
        });
      } catch (error) {
        console.error('Failed to initialize MongoDB:', error);
        setDbStatus({
          success: false,
          message: `MongoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initDb();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {isInitializing && (
        <Loading size="lg" message="Initializing database..." />
      )}

      {!isInitializing && dbStatus && (
        <Alert variant={dbStatus.success ? "default" : "destructive"}>
          {dbStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{dbStatus.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{dbStatus.message}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Dashboard Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Statistics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
