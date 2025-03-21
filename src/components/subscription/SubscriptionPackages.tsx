
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { UserRole } from '@/types/auth';

export interface SubscriptionPackagesProps {
  userRole?: UserRole | string;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole = 'User' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    packages, 
    isLoading, 
    error, 
    fetchPackagesByType 
  } = useSubscriptionPackages();
  
  const [activePackageType, setActivePackageType] = useState<string>('Business');
  
  useEffect(() => {
    if (userRole === 'Business') {
      setActivePackageType('Business');
      fetchPackagesByType('Business');
    } else if (userRole === 'Influencer') {
      setActivePackageType('Influencer');
      fetchPackagesByType('Influencer');
    } else {
      fetchPackagesByType('Business');
    }
  }, [userRole]);
  
  const handlePackageTypeChange = (type: string) => {
    setActivePackageType(type);
    fetchPackagesByType(type);
  };
  
  const handleSubscribe = (packageId: string) => {
    // Redirect to subscription details page
    navigate(`/subscription/${packageId}`);
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Loading packages...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">Error loading packages: {error.message}</div>;
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect subscription package that fits your needs
        </p>
        
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant={activePackageType === 'Business' ? 'default' : 'outline'}
            onClick={() => handlePackageTypeChange('Business')}
          >
            Business Plans
          </Button>
          <Button
            variant={activePackageType === 'Influencer' ? 'default' : 'outline'}
            onClick={() => handlePackageTypeChange('Influencer')}
          >
            Influencer Plans
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              {pkg.popular && <Badge className="self-start mb-2">Most Popular</Badge>}
              <CardTitle className="text-2xl">{pkg.title}</CardTitle>
              <CardDescription>{pkg.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-4">
                <span className="text-4xl font-bold">₹{pkg.price}</span>
                {pkg.billingCycle && (
                  <span className="text-gray-600">/{pkg.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                )}
                {pkg.setupFee > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    + ₹{pkg.setupFee} setup fee
                  </div>
                )}
              </div>
              
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={pkg.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(pkg.id)}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {packages.length === 0 && (
          <div className="text-center col-span-3 py-10">
            No packages available for {activePackageType} type.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPackages;
