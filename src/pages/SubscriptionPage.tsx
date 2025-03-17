
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionPackages } from "@/components/subscription/SubscriptionPackages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/contexts/AuthContext";
import Loading from "@/components/ui/loading";

const SubscriptionPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Default to Business role when coming from the CTA section or when user is not authenticated
  const userRole: UserRole = user?.role || "Business";
  
  useEffect(() => {
    // Log page load to help with debugging
    console.log("Subscription page loaded", { 
      isAuthenticated, 
      userRole,
      user,
      loading
    });
  }, [isAuthenticated, userRole, user, loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loading size="lg" message="Loading subscription information..." />
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
      
      <SubscriptionPackages userRole={userRole} />
    </div>
  );
};

export default SubscriptionPage;
