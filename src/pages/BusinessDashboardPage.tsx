
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessDashboard from "@/components/dashboard/business/BusinessDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { doc, onSnapshot, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

const BusinessDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("🔍 Checking subscription for user:", user.id);
      
      // Initial fetch to quickly get subscription data
      const fetchInitialData = async () => {
        try {
          const userRef = doc(db, "users", user.id);
          const docSnapshot = await getDoc(userRef);
          
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            console.log("📊 Initial Firestore user data:", userData);
            
            // Check for subscription status in different paths
            if (userData?.subscription?.status) {
              setSubscriptionStatus(userData.subscription.status);
              console.log("✅ Initial subscription status from Firestore:", userData.subscription.status);
            } else if (userData?.subscriptionStatus) {
              setSubscriptionStatus(userData.subscriptionStatus);
              console.log("✅ Initial legacy subscription status from Firestore:", userData.subscriptionStatus);
            } else {
              console.log("⚠️ No subscription status found in user document");
              
              // Try querying subscriptions collection as a fallback
              try {
                const subscriptionsQuery = query(
                  collection(db, "subscriptions"), 
                  where("userId", "==", user.id)
                );
                const subscriptionDocs = await getDocs(subscriptionsQuery);
                
                if (!subscriptionDocs.empty) {
                  const latestSubscription = subscriptionDocs.docs[0].data();
                  console.log("📊 Found subscription in subscriptions collection:", latestSubscription);
                  setSubscriptionStatus(latestSubscription.status || null);
                } else {
                  console.log("⚠️ No subscription found in subscriptions collection");
                }
              } catch (subError) {
                console.error("❌ Error querying subscriptions:", subError);
              }
            }
          } else {
            console.log("⚠️ User document doesn't exist in Firestore");
          }
        } catch (error) {
          console.error("❌ Error getting initial data:", error);
        }
      };
      
      fetchInitialData();
      
      // Set up a Firestore listener for subscription updates
      const userRef = doc(db, "users", user.id);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        setIsLoading(false);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log("📊 Firestore real-time update for user:", user.id);
          console.log("Full user data:", userData);
          
          // Check for subscription status in different paths
          if (userData?.subscription?.status) {
            setSubscriptionStatus(userData.subscription.status);
            console.log("✅ Real-time subscription status from Firestore:", userData.subscription.status);
          } else if (userData?.subscriptionStatus) {
            setSubscriptionStatus(userData.subscriptionStatus);
            console.log("✅ Real-time legacy subscription status from Firestore:", userData.subscriptionStatus);
          } else {
            console.log("⚠️ No subscription found in Firestore real-time update");
            // No subscription found in Firestore, check local storage as fallback
            const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
            const subscription = userSubscriptions[user.id];
            
            if (subscription?.status) {
              setSubscriptionStatus(subscription.status);
              console.log("✅ Subscription status from localStorage:", subscription.status);
            } else {
              console.log("❌ No subscription found in localStorage either");
              setSubscriptionStatus(null);
            }
          }
        } else {
          console.log("User document doesn't exist in Firestore");
          setSubscriptionStatus(null);
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
