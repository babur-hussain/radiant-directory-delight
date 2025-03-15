
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessDashboard from "@/components/dashboard/business/BusinessDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { listenToUserSubscription } from "@/lib/subscription-utils";

const BusinessDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("🔍 Setting up subscription listener for user:", user.id);
      
      // Set up real-time listener for user subscription
      const unsubscribe = listenToUserSubscription(
        user.id,
        (subscription) => {
          setIsLoading(false);
          if (subscription) {
            setSubscriptionStatus(subscription.status);
            console.log("✅ Real-time subscription update:", subscription.status);
          } else {
            setSubscriptionStatus(null);
            console.log("⚠️ No subscription found in real-time update");
          }
        },
        (error) => {
          console.error("❌ Error in subscription listener:", error);
          setIsLoading(false);
          setSubscriptionStatus(null);
        }
      );
      
      return () => {
        console.log("Cleaning up subscription listener");
        unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access your dashboard" />;
  }

  // Update this condition to allow both Business users and Admin users
  if (user?.role !== "Business" && user?.role !== "Admin" && !user?.isAdmin) {
    return <AccessDenied message="This dashboard is only available for businesses" />;
  }

  return (
    <DashboardLayout>
      <BusinessDashboard userId={user.id} subscriptionStatus={subscriptionStatus} />
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
