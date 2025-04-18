
import axios from 'axios';
import { API_BASE_URL } from '@/api/core/apiService';

/**
 * Checks if the MongoDB server is available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  console.log("Checking server availability...");
  
  try {
    // Try alternate endpoints to check server availability with a short timeout
    const endpoints = ['/test-connection', '/subscription-packages'];
    
    for (const endpoint of endpoints) {
      try {
        // Use a shorter timeout for faster response
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, { 
          timeout: 3000, // Very short timeout for faster response
          validateStatus: (status) => status >= 200 && status < 500 // Accept any non-server error response
        });
        
        // If we got any response at all, consider the server available
        if (response) {
          console.log(`Server is available via ${endpoint}, response:`, response.data);
          return true;
        }
      } catch (err) {
        // Try the next endpoint if this one fails
        console.log(`Endpoint ${endpoint} check failed, trying next...`);
      }
    }
    
    // If all endpoints failed, server is not available
    console.log("All server endpoints failed to respond");
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
 * THIS SHOULD ONLY BE USED AS A LAST RESORT
 */
export const getLocalFallbackPackages = (type?: string): any[] => {
  console.log("WARNING: Using fallback subscription data - THIS SHOULD ONLY HAPPEN WHEN SERVER IS DOWN");
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
