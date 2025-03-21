
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useSubscriptionPackagesByType } from '@/hooks/useSubscriptionPackages';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPackagesProps {
  type?: 'Business' | 'Influencer';
  onSelectPackage?: (pkg: ISubscriptionPackage) => void;
  compact?: boolean;
  showTitle?: boolean;
  showComparisonLink?: boolean;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ 
  type = 'Business',
  onSelectPackage,
  compact = false,
  showTitle = true,
  showComparisonLink = true
}) => {
  const { data: packages = [], isLoading, isError } = useSubscriptionPackagesByType(type);
  const [view, setView] = useState<'monthly' | 'yearly'>('yearly');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else if (user) {
      navigate(`/checkout?package=${pkg.id}`);
    } else {
      navigate(`/auth?redirect=checkout&package=${pkg.id}`);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading packages...</div>;
  }
  
  if (isError || packages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subscription packages available. Please check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{type} Subscription Plans</h2>
          <p className="text-muted-foreground mt-2">Choose the perfect plan for your needs</p>
        </div>
      )}
      
      {packages.some(pkg => pkg.paymentType === 'recurring' && pkg.billingCycle === 'monthly') && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 bg-muted rounded-lg">
            <Button 
              variant={view === 'monthly' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('monthly')}
              className="rounded-md"
            >
              Monthly
            </Button>
            <Button 
              variant={view === 'yearly' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('yearly')}
              className="rounded-md"
            >
              Yearly
            </Button>
          </div>
        </div>
      )}
      
      <div className={`grid ${compact ? 'grid-cols-1 md:grid-cols-3 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
        {packages.map((pkg) => {
          // Skip monthly packages when in yearly view and vice versa
          if (pkg.paymentType === 'recurring') {
            if (view === 'monthly' && pkg.billingCycle !== 'monthly') {
              return null;
            }
            if (view === 'yearly' && pkg.billingCycle !== 'yearly') {
              return null;
            }
          }
          
          return (
            <Card 
              key={pkg.id}
              className={`flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
            >
              <CardHeader className={compact ? 'pb-2' : ''}>
                {pkg.popular && (
                  <Badge className="w-fit mb-2" variant="default">Most Popular</Badge>
                )}
                <CardTitle className={compact ? 'text-lg' : 'text-xl'}>{pkg.title}</CardTitle>
                <CardDescription>{pkg.shortDescription}</CardDescription>
                
                <div className="mt-2">
                  <span className="text-3xl font-bold">₹{pkg.price}</span>
                  {pkg.paymentType === 'recurring' && (
                    <span className="text-muted-foreground ml-1">
                      /{pkg.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                
                {pkg.paymentType === 'recurring' && pkg.billingCycle === 'yearly' && pkg.monthlyPrice && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Just ₹{pkg.monthlyPrice}/mo billed annually
                  </div>
                )}
              </CardHeader>
              
              <CardContent className={compact ? 'pt-0 pb-2' : ''}>
                <ul className={`space-y-${compact ? '1' : '2'}`}>
                  {pkg.features && pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className={compact ? 'text-sm' : ''}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="mt-auto">
                <Button 
                  onClick={() => handleSelectPackage(pkg)} 
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {showComparisonLink && (
        <div className="text-center mt-8">
          <Button variant="link" onClick={() => navigate('/pricing/comparison')}>
            Compare all features <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPackages;
