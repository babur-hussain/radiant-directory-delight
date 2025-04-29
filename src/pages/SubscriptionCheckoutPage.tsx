
import React from 'react';
import { useParams } from 'react-router-dom';
import SubscriptionCheckout from '../components/subscription/SubscriptionCheckout';
import { getPackageById } from '../data/subscriptionData';

const SubscriptionCheckoutPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const selectedPackage = packageId ? getPackageById(packageId) : null;

  if (!selectedPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Package Not Found</h1>
        <p className="mb-4">The subscription package you selected could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SubscriptionCheckout 
        selectedPackage={selectedPackage} 
        onBack={() => window.history.back()}
      />
    </div>
  );
};

export default SubscriptionCheckoutPage;
