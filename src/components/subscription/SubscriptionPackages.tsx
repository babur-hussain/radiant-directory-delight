
import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { businessPackages, influencerPackages } from "@/data/subscriptionData";
import { useNavigate } from "react-router-dom";

interface SubscriptionPackagesProps {
  userRole: UserRole;
}

export const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  const packages = userRole === "Business" ? businessPackages : influencerPackages;

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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
