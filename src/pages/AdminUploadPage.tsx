
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CSVUploader from '@/components/admin/CSVUploader';

const AdminUploadPage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Mock initialization
    const initData = async () => {
      try {
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize data. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    initData();
  }, []);
  
  const handleUploadStart = () => {
    console.log("Upload started");
  };
  
  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    console.log("Upload completed:", { success, message, count });
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Data</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">CSV File Upload</h2>
        
        <CSVUploader 
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
};

export default AdminUploadPage;
