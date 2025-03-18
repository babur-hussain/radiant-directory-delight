
import { useState, useEffect } from "react";
import { UserRole } from "@/types/auth";

// Mock data - in a real app, this would come from an API or database
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

// Convert these to use proper types
export const useDashboardServices = (userId: string, role: UserRole) => {
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we would fetch this from an API
        // For now, we'll use mock data based on the user ID
        // This simulates different subscription plans
        
        // Wait a bit to simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use the last character of the user ID to determine which plan they have
        // This is just for demo purposes
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
