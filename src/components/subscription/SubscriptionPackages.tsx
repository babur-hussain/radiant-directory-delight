
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, Sparkles, Zap, Star, Crown } from 'lucide-react';
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
  const { packages, isLoading, isError, error, refetch } = useSubscriptionPackages(userRole);
  const navigate = useNavigate();
  
  console.log('=== SubscriptionPackages Render ===');
  console.log('User Role:', userRole);
  console.log('Loading:', isLoading);
  console.log('Error:', isError);
  console.log('Packages:', packages);
  console.log('Packages Length:', packages?.length);

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected:", pkg.title);
    
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else {
      navigate(`/subscription/details/${pkg.id}`);
    }
    
    toast.success(`Selected ${pkg.title}`);
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
            {error?.message || 'There was an error loading the subscription packages.'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="bg-white">
            <Loader2 className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="subscription-packages-container">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Sparkles className="h-12 w-12 mx-auto mb-2 text-purple-400" />
            <h3 className="text-lg font-semibold">No {userRole} Packages Available</h3>
            <p className="text-sm mt-2">New packages for {userRole}s will be available soon!</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-packages-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
        {packages.map((pkg) => {
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
              className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] transform ${
                isPopular 
                  ? 'border-2 border-purple-500 shadow-xl bg-gradient-to-br from-purple-50 via-white to-indigo-50' 
                  : 'border shadow-lg hover:border-purple-300 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-25'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white text-center py-3 z-10">
                  <Badge className="bg-white text-purple-600 font-bold px-4 py-1.5 text-sm shadow-lg">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {/* Floating accent decoration */}
              <div className={`absolute top-4 right-4 w-12 h-12 rounded-full opacity-20 ${
                isPopular ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-gradient-to-br from-gray-400 to-blue-400'
              }`}></div>
              
              <CardContent className={`p-6 ${isPopular ? 'pt-20' : 'pt-8'} relative z-10`}>
                <div className="space-y-6">
                  {/* Package Header */}
                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 group-hover:text-purple-700 transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="flex items-baseline justify-center mb-3">
                      <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-500 ml-2 text-lg">{timeframe}</span>
                    </div>
                    {pkg.shortDescription && (
                      <p className="text-gray-600 text-base leading-relaxed">{pkg.shortDescription}</p>
                    )}
                  </div>
                  
                  {/* Features List */}
                  <div className="space-y-3">
                    {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                      pkg.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-start group/feature">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 group-hover/feature:bg-green-200 transition-colors">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base leading-relaxed group-hover/feature:text-gray-900 transition-colors">
                            {feature}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <Star className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-gray-500 text-sm sm:text-base">
                          Package features will be updated soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-2">
                <Button 
                  className={`w-full h-14 text-base font-bold relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                    isPopular 
                      ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-600 hover:to-indigo-600 text-white'
                  }`}
                  onClick={() => handleSelectPackage(pkg)}
                  type="button"
                >
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    {isPopular ? <Zap className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    <span>Subscribe Now</span>
                  </div>
                  
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] hover:translate-x-[100%]"></div>
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
