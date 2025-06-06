
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Define dashboard sections for each role
export const BUSINESS_DASHBOARD_SECTIONS = [
  "ratings",
  "creatives",
  "google_listing",
  "reels",
  "seo",
  "growth",
  "leads",
  "campaigns"
];

export const INFLUENCER_DASHBOARD_SECTIONS = [
  "reels",
  "creatives",
  "ratings",
  "seo",
  "google_listing",
  "performance",
  "leads",
  "rank"
];

// Function to get dashboard sections for a user
export const getUserDashboardSections = async (userId: string, role?: string) => {
  try {
    console.log(`Fetching dashboard sections for user ${userId} ${role ? `with role ${role}` : ''} from MongoDB`);
    
    const response = await axios.get(`http://localhost:3001/api/dashboard-sections?userId=${userId}${role ? `&role=${role}` : ''}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard sections:", error);
    toast({
      title: "Error",
      description: "Failed to load dashboard sections. Using defaults.",
      variant: "destructive"
    });
    
    // Return default sections based on role
    if (role === "Business") {
      return BUSINESS_DASHBOARD_SECTIONS;
    } else if (role === "Influencer") {
      return INFLUENCER_DASHBOARD_SECTIONS;
    }
    
    return [];
  }
};

// Function to save dashboard sections for a user
export const updateUserDashboardSections = async (userId: string, sections: string[]) => {
  try {
    console.log(`Saving dashboard sections for user ${userId} to MongoDB`);
    
    await axios.post('http://localhost:3001/api/dashboard-sections', {
      userId,
      sections
    });
    
    return true;
  } catch (error) {
    console.error("Error saving dashboard sections:", error);
    toast({
      title: "Error",
      description: "Failed to save dashboard sections.",
      variant: "destructive"
    });
    return false;
  }
};

// Function to save dashboard sections for a package
export const updatePackageDashboardSections = async (packageId: string, sections: string[]) => {
  try {
    console.log(`Saving dashboard sections for package ${packageId} to MongoDB`);
    
    await axios.post('http://localhost:3001/api/package-sections', {
      packageId,
      sections
    });
    
    return true;
  } catch (error) {
    console.error("Error saving package dashboard sections:", error);
    toast({
      title: "Error",
      description: "Failed to save package dashboard sections.",
      variant: "destructive"
    });
    return false;
  }
};

// Function to get available sections for a role
export const getAvailableSectionsForRole = (role: string) => {
  if (role === "Business") {
    return [
      { id: "ratings", name: "Business Ratings" },
      { id: "creatives", name: "Creative Designs" },
      { id: "google_listing", name: "Google Business Listing" },
      { id: "reels", name: "Reels & Ads" },
      { id: "seo", name: "SEO Optimization" },
      { id: "growth", name: "Growth Analytics" },
      { id: "leads", name: "Leads & Inquiries" },
      { id: "campaigns", name: "Marketing Campaigns" }
    ];
  } else if (role === "Influencer") {
    return [
      { id: "reels", name: "Reels Progress" },
      { id: "creatives", name: "Creatives Tracker" },
      { id: "ratings", name: "Ratings & Reviews" },
      { id: "seo", name: "SEO Progress" },
      { id: "google_listing", name: "Google Listing Status" },
      { id: "performance", name: "Performance Metrics" },
      { id: "leads", name: "Leads Generated" },
      { id: "rank", name: "Influencer Rank" }
    ];
  }
  
  return [];
};
