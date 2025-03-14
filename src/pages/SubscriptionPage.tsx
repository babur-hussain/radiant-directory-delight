
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionPackages } from "@/components/subscription/SubscriptionPackages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Please sign in to view and subscribe to our plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to access subscription plans.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose Your Subscription Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the best plan for your needs. All plans include our core features with different levels of access.
        </p>
      </div>
      
      <SubscriptionPackages userRole={user?.role} />
    </div>
  );
};

export default SubscriptionPage;
