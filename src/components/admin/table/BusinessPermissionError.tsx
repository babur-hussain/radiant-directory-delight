
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BusinessPermissionErrorProps {
  errorMessage: string;
}

const BusinessPermissionError: React.FC<BusinessPermissionErrorProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-base font-semibold">Permission Error</AlertTitle>
      <AlertDescription className="text-sm mt-1">
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};

export default BusinessPermissionError;
