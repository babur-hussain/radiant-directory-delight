
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GemIcon, TrendingUp, ShieldCheck } from 'lucide-react';
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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPackages.map((pkg) => {
          const isPopular = pkg.popular;
          const isOneTime = pkg.paymentType === 'one-time';
          const gradientClass = userRole === "Business" 
            ? "from-blue-500 via-cyan-500 to-teal-500" 
            : "from-purple-500 via-violet-500 to-indigo-500";
            
          return (
            <Card 
              key={pkg.id} 
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl relative ${
                isPopular ? 'border-2 border-primary shadow-lg' : 'border shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-primary to-primary-foreground text-white font-medium m-2 px-3 py-1">
                    <GemIcon className="h-3.5 w-3.5 mr-1" /> Popular Choice
                  </Badge>
                </div>
              )}
              
              {isOneTime && (
                <div className="absolute top-0 left-0">
                  <Badge className="bg-amber-500 text-white font-medium m-2 px-3 py-1">
                    One-time
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`pb-4 ${isPopular ? 'bg-gradient-to-r bg-opacity-10 ' + gradientClass : ''}`}>
                <CardTitle className="text-2xl font-bold flex flex-col">
                  <span>{pkg.title}</span>
                  <div className="flex flex-col mt-2">
                    {pkg.monthlyPrice ? (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary">₹{pkg.monthlyPrice}</span>
                        <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary">₹{pkg.price}</span>
                        {isOneTime ? (
                          <span className="text-sm font-normal text-muted-foreground ml-1">total</span>
                        ) : (
                          <span className="text-sm font-normal text-muted-foreground ml-1">/year</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-sm mt-1">{pkg.shortDescription}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {isOneTime 
                      ? `One-time payment valid for ${pkg.durationMonths || 12} months` 
                      : `Annual billing`}
                  </p>
                </div>
                
                <ul className="space-y-2.5">
                  {pkg.features?.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="flex-col space-y-3 pt-2 pb-6">
                <Button 
                  className={`w-full bg-gradient-to-r ${gradientClass} hover:shadow-md transition-all duration-300`}
                  onClick={() => handleDetailsClick(pkg)}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-sm border-primary/30 hover:bg-primary/5"
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
