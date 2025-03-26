import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import SubscriptionDialog from './SubscriptionDialog';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';

interface SubscriptionPackagesProps {
  userRole?: string;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole = 'User' }) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .order('price', { ascending: true });
        
        if (error) {
          console.error('Error fetching subscription packages:', error);
          return;
        }
        
        if (data) {
          setPackages(data as ISubscriptionPackage[]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, []);

  const handlePurchase = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <p>Loading subscription packages...</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold leading-none tracking-tight">
              {pkg.title}
            </CardTitle>
            <CardDescription>
              {pkg.shortDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center">
              {pkg.popular && (
                <Badge variant="secondary" className="mr-2">
                  Popular
                </Badge>
              )}
              {userRole === 'Admin' && (
                <Badge variant="outline" className="mr-2">
                  Admin
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold">₹{pkg.price}</div>
            <ul className="grid gap-2">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handlePurchase(pkg)}>
              Get Started <Zap className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {selectedPackage && (
        <SubscriptionDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedPackage={selectedPackage}
        />
      )}
    </div>
  );
};

export default SubscriptionPackages;
