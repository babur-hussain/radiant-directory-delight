
import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionPackagesProps {
  userRole: UserRole;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Use our hook to fetch packages
  const { packages, isLoading, error } = useSubscriptionPackages(userRole);

  if (!userRole) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Please select a role first</h2>
        <p>You need to complete your profile and select a role (Business or Influencer) before viewing subscription plans.</p>
      </div>
    );
  }

  const handleSubscribe = (packageId: string) => {
    navigate(`/subscription/details/${packageId}`);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="pb-1">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 mb-4">
                {Array(4).fill(0).map((_, i) => (
                  <li key={i} className="flex items-start">
                    <Skeleton className="h-4 w-4 mr-2 mt-1" />
                    <Skeleton className="h-4 w-full" />
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Split packages into recurring and one-time
  const recurringPackages = packages.filter(pkg => pkg.paymentType === "recurring" || !pkg.paymentType);
  const oneTimePackages = packages.filter(pkg => pkg.paymentType === "one-time");
  
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
      {oneTimePackages.length > 0 && (
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
                    <span className="text-3xl font-bold">₹{pkg.price}</span>
                    <span className="text-muted-foreground mb-1">one-time</span>
                  </div>
                  <CardDescription>{pkg.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, i) => (
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
