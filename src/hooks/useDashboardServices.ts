
import { useState, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { getUserDashboardSections } from "@/utils/dashboardSections";

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

  useEffect(() => {
    const fetchUserServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }
        
        // Try to fetch sections from MongoDB first
        const userSections = await getUserDashboardSections(userId);
        
        if (userSections && userSections.length > 0) {
          console.log(`Found ${userSections.length} dashboard sections for user ${userId}`);
          setServices(userSections);
          return;
        }
        
        console.log("No dashboard sections found in MongoDB, using mock data");
        
        // Fallback to mock data if no sections found in the database
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
        } else if (role === "Business") {
          setServices(mockBusinessPlans[planType] || mockBusinessPlans.default);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard services:", err);
        setError("Failed to load your dashboard services. Please try again later.");
        
        // Fallback to default sections based on role
        if (role === "Influencer") {
          setServices(mockInfluencerPlans.default);
        } else if (role === "Business") {
          setServices(mockBusinessPlans.default);
        } else {
          setServices([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && role) {
      fetchUserServices();
    }
  }, [userId, role]);

  return { services, isLoading, error };
};
