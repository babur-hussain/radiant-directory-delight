
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GemIcon, TrendingUp, Clock, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionDialog from './SubscriptionDialog';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export interface SubscriptionPackagesProps {
  userRole: UserRole | string;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const filteredPackages = packages?.filter(pkg => pkg.type === userRole) || [];

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setShowDialog(true);
  };

  const handleDetailsClick = (pkg: ISubscriptionPackage) => {
    navigate(`/subscription/details/${pkg.id}`);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedPackage(null);
  };

  // Format currency with Indian format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {[1, 2, 3].map(i => (
        <Card key={i} className="opacity-70">
          <CardHeader className="pb-4">
            <div className="h-7 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-3 pt-0">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>;
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

  // Determine gradient classes based on user role
  const getGradientClass = (isPopular: boolean) => {
    if (!isPopular) return '';
    
    return userRole === "Business" 
      ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30" 
      : "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30";
  };

  // Border color for popular packages
  const getBorderClass = (isPopular: boolean) => {
    if (!isPopular) return 'border shadow-md hover:shadow-lg';
    
    return userRole === "Business" 
      ? "border-2 border-blue-400 shadow-lg hover:shadow-xl" 
      : "border-2 border-purple-400 shadow-lg hover:shadow-xl";
  };

  // Button gradient for user role
  const getButtonGradient = () => {
    return userRole === "Business" 
      ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:opacity-90" 
      : "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:opacity-90";
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPackages.map((pkg) => {
          const isPopular = pkg.popular;
          const isRecurring = pkg.paymentType === 'recurring';
          const isMonthly = pkg.billingCycle === 'monthly';
          
          return (
            <Card 
              key={pkg.id} 
              className={`overflow-hidden transition-all duration-300 ${getBorderClass(isPopular)}`}
            >
              <CardHeader className={`pb-4 ${getGradientClass(isPopular)}`}>
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className={`${userRole === "Business" ? "bg-blue-500" : "bg-purple-500"} text-white font-medium m-2 px-3 py-1`}>
                      <GemIcon className="h-3.5 w-3.5 mr-1" /> Popular Choice
                    </Badge>
                  </div>
                )}
                
                <CardTitle className="text-xl font-bold">
                  {pkg.title}
                </CardTitle>
                <CardDescription className="text-sm mt-1">{pkg.shortDescription}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-6">
                <div className="mb-6 space-y-1">
                  {/* Price display - show monthly for recurring monthly, show per year for recurring yearly */}
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-primary">
                      {isRecurring && isMonthly && pkg.monthlyPrice 
                        ? formatCurrency(pkg.monthlyPrice) 
                        : formatCurrency(pkg.price)}
                    </p>
                    <span className="text-sm text-muted-foreground ml-2">
                      {isRecurring ? (isMonthly ? '/month' : '/year') : 'one-time'}
                    </span>
                  </div>

                  {/* Additional pricing details */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {isRecurring && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        <span>{pkg.durationMonths || 12} months</span>
                      </div>
                    )}
                    
                    {pkg.setupFee > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CreditCard className="h-3 w-3 mr-1 inline" />
                        <span>Setup: {formatCurrency(pkg.setupFee)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {pkg.features?.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-start text-sm group">
                      <CheckCircle className={`h-4 w-4 mr-2 mt-0.5 shrink-0 ${isPopular ? (userRole === "Business" ? "text-blue-500" : "text-purple-500") : "text-green-500"}`} />
                      <span className="group-hover:text-primary transition-colors">{feature}</span>
                    </div>
                  ))}
                  
                  {pkg.features?.length > 5 && (
                    <p className="text-xs text-muted-foreground ml-6">
                      +{pkg.features.length - 5} more features
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex-col space-y-3 pt-0">
                <Button 
                  className={`w-full ${getButtonGradient()} text-white hover:shadow-md transition-all duration-300`}
                  onClick={() => handleDetailsClick(pkg)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-sm"
                  onClick={() => handleSelectPackage(pkg)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
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
