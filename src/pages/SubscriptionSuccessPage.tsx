
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const SubscriptionSuccessPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-lg mb-8">
        Thank you for your subscription. Your account has been activated.
      </p>
      <Button asChild className="w-full">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
};

export default SubscriptionSuccessPage;
