import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface SubscriptionPackagesProps {
  userRole: UserRole | string;
  onSelectPackage?: (pkg: ISubscriptionPackage) => void;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ 
  userRole,
  onSelectPackage
}) => {
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const navigate = useNavigate();
  
  const filteredPackages = packages?.filter(pkg => pkg.type === userRole) || [];

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected:", pkg.title);
    
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else {
      navigate(`/subscription/details/${pkg.id}`);
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading subscription packages...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500">Error loading subscription packages. Please try again later.</p>;
  }

  if (filteredPackages.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg shadow-sm bg-gray-50">
        <p className="text-muted-foreground">No packages available for {userRole}s at the moment.</p>
        <p className="mt-2 text-sm">Please check back later or contact our support team.</p>
      </div>
    );
  }

  return (
    <div className="subscription-packages-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPackages.map((pkg) => {
          const isPopular = pkg.popular;
          const isOneTime = pkg.paymentType === 'one-time';
          const billingCycle = pkg.billingCycle || 'yearly';
          const timeframe = isOneTime ? 'total' : `/${billingCycle}`;
          
          // Determine price to display based on payment type
          const displayPrice = isOneTime ? pkg.price : 
                              (billingCycle === 'monthly' && pkg.monthlyPrice) ? pkg.monthlyPrice : pkg.price;
          
          return (
            <Card 
              key={pkg.id} 
              className={`overflow-hidden transition-all duration-200 ${
                isPopular ? 'border-2 border-blue-600 shadow-md' : 'border shadow'
              }`}
            >
              {isPopular && (
                <div className="flex justify-center -mt-0.5">
                  <Badge className="bg-blue-600 text-white font-medium rounded-t-none rounded-b-md px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6 pt-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{pkg.title}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-4xl font-extrabold">₹{displayPrice}</span>
                      <span className="text-gray-500 ml-1">{timeframe}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{pkg.shortDescription || `${pkg.type} package for your needs`}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      pkg.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Basic features included</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-2">
                <Button 
                  className="w-full h-12 text-base font-medium relative z-20"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSelectPackage(pkg)}
                  type="button"
                >
                  Subscribe Now
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPackages;
