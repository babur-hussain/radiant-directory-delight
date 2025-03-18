
import { useState, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { getUserDashboardSections } from "@/utils/dashboardSections";
import { listenToUserSubscription } from "@/lib/subscription";

// Default mock sections (fallback if database fetch fails)
const mockInfluencerPlans: Record<string, string[]> = {
  "default": ["reels", "creatives", "ratings", "seo", "google_listing", "performance", "leads", "rank"],
  "basic": ["reels", "creatives", "ratings"],
  "standard": ["reels", "creatives", "ratings", "seo", "google_listing"],
  "premium": ["reels", "creatives", "ratings", "seo", "google_listing", "performance", "leads", "rank"],
};

const mockBusinessPlans: Record<string, string[]> = {
  "default": ["marketing", "reels", "creatives", "ratings", "seo", "google_listing", "growth", "leads", "reach"],
  "basic": ["marketing", "reels", "ratings"],
  "standard": ["marketing", "reels", "creatives", "ratings", "seo"],
  "premium": ["marketing", "reels", "creatives", "ratings", "seo", "google_listing", "growth", "leads", "reach"],
};

export const useDashboardServices = (userId: string, role: UserRole) => {
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const fetchUserServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }
        
        // Try to fetch sections from the database first
        const userSections = await getUserDashboardSections(userId);
        
        if (userSections && userSections.length > 0) {
          console.log(`Found ${userSections.length} dashboard sections for user ${userId}`);
          setServices(userSections);
          setIsLoading(false);
        } else {
          // Fallback to mock data if no sections found in the database
          console.log("No dashboard sections found in database, using mock data");
          const lastChar = userId.slice(-1);
          let planType = "default";
          
          if ("123".includes(lastChar)) {
            planType = "basic";
          } else if ("456".includes(lastChar)) {
            planType = "standard";
          } else if ("789".includes(lastChar)) {
            planType = "premium";
          }
          
          if (role === "Influencer") {
            setServices(mockInfluencerPlans[planType] || mockInfluencerPlans.default);
          } else {
            setServices(mockBusinessPlans[planType] || mockBusinessPlans.default);
          }
          setIsLoading(false);
        }
        
        // Set up subscription listener to detect changes
        unsubscribe = listenToUserSubscription(userId, () => {
          // When subscription changes, trigger a re-fetch of services
          console.log("Subscription changed, refreshing dashboard services");
          setSubscriptionUpdated(prev => !prev);
        });
        
      } catch (err) {
        console.error("Error fetching dashboard services:", err);
        setError("Failed to load your dashboard services. Please try again later.");
        
        // Fallback to default sections based on role
        if (role === "Influencer") {
          setServices(mockInfluencerPlans.default);
        } else {
          setServices(mockBusinessPlans.default);
        }
        setIsLoading(false);
      }
    };

    if (userId && role) {
      fetchUserServices();
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, role, subscriptionUpdated]);

  return { services, isLoading, error };
};
