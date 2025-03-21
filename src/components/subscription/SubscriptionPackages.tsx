
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionDialog from './SubscriptionDialog';
import { ISubscriptionPackage } from '@/models/Subscription'; // Import from Subscription.ts

export interface SubscriptionPackagesProps {
  userRole: UserRole | string;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const { packages, isLoading, isError, error } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const filteredPackages = packages?.filter(pkg => pkg.type === userRole);

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedPackage(null);
  };

  if (isLoading) {
    return <p>Loading subscription packages...</p>;
  }

  if (isError) {
    return <p>Error loading subscription packages: {error?.message}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages?.map((pkg) => (
          <Card key={pkg.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">{pkg.title}</CardTitle>
              <CardDescription className="text-gray-500">{pkg.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="text-2xl font-bold">₹{pkg.price}</div>
                {pkg.monthlyPrice && <div className="text-sm text-gray-500">₹{pkg.monthlyPrice}/month</div>}
              </div>
              <ul className="list-none space-y-2">
                {pkg.features?.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-4">
              <Button className="w-full" onClick={() => handleSelectPackage(pkg)}>
                Choose Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <SubscriptionDialog 
        isOpen={showDialog}
        setIsOpen={setShowDialog}
        selectedPackage={selectedPackage}
      />
    </div>
  );
};

export default SubscriptionPackages;
