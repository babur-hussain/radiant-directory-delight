import React, { useEffect, useState } from "react";
import { Check, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Loading from "@/components/ui/loading";
import SubscriptionDialog from "./SubscriptionDialog";

interface SubscriptionPackagesProps {
  userRole: UserRole | string;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  // State for managing the subscription dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  
  // Use our hook to fetch packages from MongoDB
  const { packages, isLoading, error } = useSubscriptionPackages({ 
    type: userRole as string,
    initialOfflineMode: false
  });

  // Log for debugging
  useEffect(() => {
    console.log("SubscriptionPackages component", { 
      userRole, 
      packagesCount: packages?.length || 0,
      packages,
      isLoading,
      error
    });
  }, [userRole, packages, isLoading, error]);

  const handleSubscribe = (pkg: any) => {
    console.log("Selected package:", pkg);
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading size="lg" message={`Loading ${userRole} subscription packages...`} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading packages</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-10">
        <Alert className="max-w-xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>No packages available</AlertTitle>
          <AlertDescription>
            No subscription packages are currently available for {userRole}s.
            Please check back later or contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Split packages into recurring and one-time
  const recurringPackages = packages.filter(pkg => pkg.paymentType === "recurring" || !pkg.paymentType);
  const oneTimePackages = packages.filter(pkg => pkg.paymentType === "one-time");
  
  return (
    <div className="space-y-10">
      {/* Subscription Dialog */}
      <SubscriptionDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        selectedPackage={selectedPackage} 
      />
      
      {/* Recurring Subscription Packages */}
      {recurringPackages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recurring Subscriptions</h2>
          <p className="text-muted-foreground">Pay monthly or yearly for continuous service</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurringPackages.map((pkg) => (
              <Card key={pkg.id} className={`flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader className="pb-1">
                  {pkg.popular && <Badge className="mb-2 self-start">Most Popular</Badge>}
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">₹{pkg.price}</span>
                    <span className="text-muted-foreground mb-1">/{pkg.billingCycle || 'year'}</span>
                  </div>
                  <CardDescription>{pkg.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No features listed</li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSubscribe(pkg)} 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* One-Time Payment Packages */}
      {oneTimePackages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">One-Time Packages</h2>
          <p className="text-muted-foreground">Pay once for a fixed duration of service</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimePackages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-1">
                  <Badge variant="secondary" className="mb-2 self-start bg-amber-100 text-amber-800">One-Time Payment</Badge>
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">₹{pkg.price}</span>
                    <span className="text-muted-foreground mb-1">one-time</span>
                  </div>
                  <CardDescription>{pkg.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No features listed</li>
                    )}
                  </ul>
                  <p className="text-sm text-amber-700 mt-2">
                    Valid for {pkg.durationMonths || 12} months
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSubscribe(pkg)} 
                    className="w-full" 
                    variant="outline"
                  >
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
