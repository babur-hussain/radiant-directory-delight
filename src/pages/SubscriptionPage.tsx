
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionPackages } from "@/components/subscription/SubscriptionPackages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/contexts/AuthContext";
import Loading from "@/components/ui/loading";
import { useLocation } from "react-router-dom";

const SubscriptionPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Determine user role from either URL params, user object, or default to Business
  const getRoleFromPath = (): UserRole => {
    const path = location.pathname.toLowerCase();
    if (path.includes('influencer')) return 'Influencer';
    return 'Business';
  };
  
  // Use path-based role or fallback to user role or default
  const userRole: UserRole = getRoleFromPath() || user?.role || "Business";
  
  useEffect(() => {
    // Log page load to help with debugging
    console.log("Subscription page loaded", { 
      isAuthenticated, 
      userRole,
      user,
      path: location.pathname,
      loading
    });
  }, [isAuthenticated, userRole, user, loading, location.pathname]);

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
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {userRole === 'Influencer' ? 'Earn as an Influencer' : 'Grow Your Business'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the best plan for your needs. All plans include our core features with different levels of access.
        </p>
      </div>
      
      <SubscriptionPackages userRole={userRole} />
    </div>
  );
};

export default SubscriptionPage;
