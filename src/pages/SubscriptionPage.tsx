import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/contexts/AuthContext";
import Loading from "@/components/ui/loading";
import { useLocation } from "react-router-dom";

const SubscriptionPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  const getRoleFromPath = (): UserRole => {
    const path = location.pathname.toLowerCase();
    if (path.includes('influencer')) return 'Influencer';
    return 'Business';
  };
  
  const userRole: UserRole = getRoleFromPath() || user?.role || "Business";
  
  useEffect(() => {
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
