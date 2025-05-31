
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SubscriptionPackagesLoading from './SubscriptionPackagesLoading';

export interface SubscriptionPackagesProps {
  userRole: UserRole | string;
  onSelectPackage?: (pkg: ISubscriptionPackage) => void;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ 
  userRole,
  onSelectPackage
}) => {
  const { packages, isLoading, isError, error } = useSubscriptionPackages();
  const navigate = useNavigate();
  
  console.log('SubscriptionPackages render:', {
    isLoading,
    isError,
    packagesLength: packages?.length,
    packages,
    userRole,
    error: error?.message
  });

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected:", pkg.title);
    
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else {
      navigate(`/subscription/details/${pkg.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="subscription-packages-container">
        <SubscriptionPackagesLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="subscription-packages-container">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Unable to Load Packages</h3>
          <p className="text-gray-600 mb-4">
            Error: {error?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // Filter packages by user role
  const filteredPackages = packages.filter(pkg => {
    console.log('Filtering package:', pkg.title, 'type:', pkg.type, 'userRole:', userRole);
    return pkg.type === userRole;
  });

  console.log('Filtered packages for role', userRole, ':', filteredPackages);

  if (filteredPackages.length === 0) {
    return (
      <div className="subscription-packages-container">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Sparkles className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">No {userRole} Packages Available</h3>
            <p className="text-sm">Packages for {userRole}s will be available soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-packages-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
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
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                isPopular ? 'border-2 border-purple-600 shadow-lg relative' : 'border shadow-md hover:border-purple-300'
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white text-center py-2">
                  <Badge className="bg-white text-purple-600 font-semibold px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className={`p-4 sm:p-6 ${isPopular ? 'pt-16' : 'pt-6'} sm:pt-8`}>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">{pkg.title}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-500 ml-1 text-sm sm:text-base">{timeframe}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">{pkg.shortDescription}</p>
                  </div>
                  
                  <ul className="space-y-2 sm:space-y-3">
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      pkg.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700">Package features will be updated soon</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 sm:p-6 pt-2">
                <Button 
                  className={`w-full h-12 sm:h-14 text-sm sm:text-base font-semibold relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] ${
                    isPopular 
                      ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => handleSelectPackage(pkg)}
                  type="button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isPopular ? <Zap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    <span>Subscribe Now</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
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
