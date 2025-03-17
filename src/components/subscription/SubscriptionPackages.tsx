
import React, { useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import { businessPackages, influencerPackages } from "@/data/subscriptionData";
import Loading from "@/components/ui/loading";

interface SubscriptionPackagesProps {
  userRole: UserRole;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Use our hook to fetch packages
  const { packages, isLoading, error } = useSubscriptionPackages(userRole);

  // Fallback to static packages if no packages are loaded from MongoDB
  const displayPackages = packages && packages.length > 0 ? packages : 
    (userRole === "Influencer" ? influencerPackages : businessPackages);

  // Log for debugging
  useEffect(() => {
    console.log("SubscriptionPackages loaded", { 
      userRole, 
      packagesCount: packages?.length || 0,
      displayPackagesCount: displayPackages?.length || 0,
      isLoading,
      error
    });
  }, [userRole, packages, displayPackages?.length, isLoading, error]);

  const handleSubscribe = (packageId: string) => {
    navigate(`/subscription/details/${packageId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading size="lg" message="Loading subscription packages..." />
      </div>
    );
  }
  
  if (!displayPackages || displayPackages.length === 0) {
    return (
      <div className="text-center py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No packages available</AlertTitle>
          <AlertDescription>
            We couldn't load any subscription packages. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Split packages into recurring and one-time
  const recurringPackages = displayPackages.filter(pkg => pkg.paymentType === "recurring" || !pkg.paymentType);
  const oneTimePackages = displayPackages.filter(pkg => pkg.paymentType === "one-time");
  
  return (
    <div className="space-y-10">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Recurring Subscription Packages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recurring Subscriptions</h2>
        <p className="text-muted-foreground">Pay monthly or yearly for continuous service</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recurringPackages.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-lg text-muted-foreground">No recurring subscription packages available.</p>
            </div>
          ) : (
            recurringPackages.map((pkg) => (
              <Card key={pkg.id} className={`flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader className="pb-1">
                  {pkg.popular && <Badge className="mb-2 self-start">Most Popular</Badge>}
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">₹{pkg.price}</span>
                    <span className="text-muted-foreground mb-1">/year</span>
                  </div>
                  <CardDescription>{pkg.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSubscribe(pkg.id)} 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* One-Time Payment Packages */}
      {oneTimePackages && oneTimePackages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">One-Time Packages</h2>
          <p className="text-muted-foreground">Pay once for a fixed duration of service</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {oneTimePackages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-1">
                  <Badge variant="secondary" className="mb-2 self-start bg-amber-100 text-amber-800">One-Time Payment</Badge>
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">₹{pkg.price || 999}</span>
                    <span className="text-muted-foreground mb-1">one-time</span>
                  </div>
                  <CardDescription>{pkg.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {pkg.features && pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 mt-2">
                    Valid for {pkg.durationMonths} months
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSubscribe(pkg.id)} 
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
