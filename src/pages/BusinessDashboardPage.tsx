
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessDashboard from "@/components/dashboard/business/BusinessDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

const BusinessDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Set up a Firestore listener for subscription updates
      const userRef = doc(db, "users", user.id);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        setIsLoading(false);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          // Check for subscription status
          if (userData?.subscription?.status) {
            setSubscriptionStatus(userData.subscription.status);
            console.log("✅ Got subscription status from Firestore:", userData.subscription.status);
          } else if (userData?.subscriptionStatus) {
            setSubscriptionStatus(userData.subscriptionStatus);
            console.log("✅ Got subscription status from Firestore:", userData.subscriptionStatus);
          } else {
            // Check local storage as fallback
            const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
            const subscription = userSubscriptions[user.id];
            setSubscriptionStatus(subscription?.status || null);
          }
        }
      }, (error) => {
        console.error("Error getting real-time subscription updates:", error);
        setIsLoading(false);
        // Fall back to localStorage
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        const subscription = userSubscriptions[user.id];
        setSubscriptionStatus(subscription?.status || null);
      });
      
      return () => unsubscribe();
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

  if (user?.role !== "Business") {
    return <AccessDenied message="This dashboard is only available for businesses" />;
  }

  return (
    <DashboardLayout>
      <BusinessDashboard userId={user.id} />
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
