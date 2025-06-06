
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface InfluencerPermissionErrorProps {
  errorMessage: string;
}

const InfluencerPermissionError: React.FC<InfluencerPermissionErrorProps> = ({ errorMessage }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <Shield className="h-4 w-4" />
      <AlertTitle>Permission Error</AlertTitle>
      <AlertDescription>
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};

export default InfluencerPermissionError;
