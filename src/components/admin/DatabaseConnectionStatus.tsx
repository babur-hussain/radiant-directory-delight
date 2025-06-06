
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface DatabaseConnectionStatusProps {
  connected: boolean;
  databaseName?: string;
  error?: string;
}

const DatabaseConnectionStatus: React.FC<DatabaseConnectionStatusProps> = ({
  connected,
  databaseName = "Database",
  error
}) => {
  if (connected) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Successfully connected to {databaseName}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        {error || `Could not connect to ${databaseName}. Please check your configuration.`}
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseConnectionStatus;
