
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading, error } = useSubscription();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Any initializations here
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="warning" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not logged in</AlertTitle>
          <AlertDescription>
            Please log in to view subscription options.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <p>Loading subscription data...</p>
      </div>
    );
  }

  if (subscription) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Subscription</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">{subscription.packageName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><span className="font-medium">Status:</span> {subscription.status}</p>
              <p><span className="font-medium">Start Date:</span> {new Date(subscription.startDate).toLocaleDateString()}</p>
              <p><span className="font-medium">End Date:</span> {new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p><span className="font-medium">Amount:</span> ₹{subscription.amount}</p>
              {subscription.paymentType && (
                <p><span className="font-medium">Payment Type:</span> {subscription.paymentType}</p>
              )}
              {subscription.billingCycle && (
                <p><span className="font-medium">Billing Cycle:</span> {subscription.billingCycle}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Button>Manage Subscription</Button>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Upgrade Options</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Choose a Subscription</h1>
      <SubscriptionPackages userRole={user.role as UserRole} />
    </div>
  );
};

export default SubscriptionPage;
