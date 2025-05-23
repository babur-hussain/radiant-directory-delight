
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
  const { packages, isLoading } = useSubscriptionPackages();
  const navigate = useNavigate();
  
  // Filter packages by user role, but fallback to all packages if none match
  const filteredPackages = Array.isArray(packages) ? packages.filter(pkg => pkg.type === userRole) : [];
  const packagesToDisplay = filteredPackages.length > 0 ? filteredPackages : (Array.isArray(packages) ? packages : []);

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected:", pkg.title);
    
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else {
      navigate(`/subscription/details/${pkg.id}`);
    }
  };

  const getVisibilityRange = (pkg: ISubscriptionPackage): string => {
    if (pkg.type === 'Influencer') {
      if (pkg.price <= 299) return '200 KM radius';
      if (pkg.price <= 499) return '450 KM radius';
      return '1050 KM radius';
    }
    return 'Local area';
  };

  return (
    <div className="subscription-packages-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        {packagesToDisplay.map((pkg) => {
          const isPopular = pkg.popular;
          const isOneTime = pkg.paymentType === 'one-time';
          const billingCycle = pkg.billingCycle || 'yearly';
          const timeframe = isOneTime ? 'total' : `/${billingCycle}`;
          const visibilityRange = getVisibilityRange(pkg);
          
          // Determine price to display based on payment type
          const displayPrice = isOneTime ? pkg.price : 
                              (billingCycle === 'monthly' && pkg.monthlyPrice) ? pkg.monthlyPrice : pkg.price;
          
          // Determine package tier for influencer packages
          let packageTier = '';
          if (pkg.type === 'Influencer') {
            if (pkg.price <= 299) packageTier = 'Basic';
            else if (pkg.price <= 499) packageTier = 'Pro';
            else packageTier = 'Premium';
          } else if (pkg.type === 'Business') {
            packageTier = 'Local Connect';
          }
          
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
                    <h3 className="text-2xl font-bold">{packageTier || pkg.title}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-4xl font-extrabold">₹{displayPrice}</span>
                      <span className="text-gray-500 ml-1">{timeframe}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{pkg.shortDescription || `${visibilityRange} visibility`}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      pkg.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : pkg.type === 'Influencer' ? (
                      <>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{visibilityRange} visibility</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Category showcase</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{packageTier === 'Premium' ? 'Premium placement' : 'Standard placement'}</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Access to local influencer lists</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Category-based recommendations</span>
                        </li>
                      </>
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
