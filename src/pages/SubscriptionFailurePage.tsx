
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const SubscriptionFailurePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
      <p className="text-lg mb-8">
        We couldn't process your payment. Please try again or contact support.
      </p>
      <div className="space-y-4">
        <Button asChild variant="default" className="w-full">
          <Link to="/subscription">Try Again</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionFailurePage;
