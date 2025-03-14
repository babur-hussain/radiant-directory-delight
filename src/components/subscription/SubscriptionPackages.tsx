
import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionPackagesProps {
  userRole: UserRole;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Use our new hook to fetch packages
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {error && (
        <div className="col-span-full mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      {packages.map((pkg) => (
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
      ))}
    </div>
  );
};
