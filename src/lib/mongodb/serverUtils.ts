
import { api } from '@/api/core/apiService';

/**
 * Checks if the MongoDB server is available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  console.log("Checking server availability...");
  
  try {
    // Use a shorter timeout for faster response
    const response = await api.get('/test-connection', { 
      timeout: 5000, // Reduced from 8000ms to 5000ms for faster response
      validateStatus: (status) => status >= 200 && status < 500 // Accept any non-server error response
    });
    
    // Log the response for debugging
    console.log("Server availability check response:", response);
    
    // If we got any response at all, consider the server available
    if (response) {
      console.log("Server is available, response:", response.data);
      return true;
    }
    
    return false;
  } catch (error) {
    if (error.response) {
      // If we got a response object, the server is available even if there's an error
      console.log("Server returned an error response, but is available:", error.response.status);
      return true;
    }
    
    // If it's a network error or timeout, server is not available
    console.error("Server not available:", error.message || "Unknown error");
    return false;
  }
}

/**
 * Gets local fallback data when server is unavailable
 */
export const getLocalFallbackPackages = (type?: string): any[] => {
  // Default fallback packages for when server is unavailable
  const fallbackPackages = [
    {
      id: "fallback_business_basic",
      title: "Business Basic",
      type: "Business",
      price: 999,
      billingCycle: "yearly",
      features: ["Basic business listing", "Email support", "1 location"],
      shortDescription: "Essential package for small businesses",
      fullDescription: "Get your business online with our essential package.",
      durationMonths: 12,
      setupFee: 0,
      paymentType: "recurring",
      popular: false,
      isActive: true
    },
    {
      id: "fallback_business_premium",
      title: "Business Premium",
      type: "Business",
      price: 1999,
      billingCycle: "yearly",
      features: ["Premium business listing", "Priority support", "5 locations", "Featured in search"],
      shortDescription: "Complete package for growing businesses",
      fullDescription: "Everything you need to grow your business online.",
      durationMonths: 12,
      setupFee: 0,
      paymentType: "recurring",
      popular: true,
      isActive: true
    },
    {
      id: "fallback_influencer_starter",
      title: "Influencer Starter",
      type: "Influencer",
      price: 599,
      billingCycle: "yearly",
      features: ["Profile listing", "Basic analytics", "Business connections"],
      shortDescription: "Start your influencer journey",
      fullDescription: "Begin your influencer career with the essential tools.",
      durationMonths: 12,
      setupFee: 0,
      paymentType: "recurring",
      popular: false,
      isActive: true
    },
    {
      id: "fallback_influencer_pro",
      title: "Influencer Pro",
      type: "Influencer",
      price: 1499,
      billingCycle: "yearly",
      features: ["Featured profile", "Advanced analytics", "Priority business matches", "Promotion tools"],
      shortDescription: "Professional tools for serious influencers",
      fullDescription: "Take your influence to the next level with pro tools.",
      durationMonths: 12,
      setupFee: 0,
      paymentType: "recurring",
      popular: true,
      isActive: true
    }
  ];

  if (!type) {
    return fallbackPackages;
  }
  
  return fallbackPackages.filter(pkg => pkg.type === type);
};
