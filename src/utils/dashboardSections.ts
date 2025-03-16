
import { User } from '../models/User';
import { SubscriptionPackage } from '../models/SubscriptionPackage';
import { connectToMongoDB } from '../config/mongodb';

// Available dashboard sections for Business users
export const BUSINESS_DASHBOARD_SECTIONS = [
  'marketing',
  'reels',
  'creatives',
  'ratings',
  'seo',
  'google_listing',
  'growth',
  'leads',
  'reach'
];

// Available dashboard sections for Influencer users
export const INFLUENCER_DASHBOARD_SECTIONS = [
  'reels',
  'creatives',
  'ratings',
  'seo',
  'google_listing',
  'performance',
  'leads',
  'rank'
];

// Get dashboard sections for a specific role
export const getDashboardSectionsByRole = (role: string): string[] => {
  return role === 'Business' ? BUSINESS_DASHBOARD_SECTIONS : INFLUENCER_DASHBOARD_SECTIONS;
};

// Get dashboard sections for a specific user
export const getUserDashboardSections = async (userId: string): Promise<string[]> => {
  try {
    await connectToMongoDB();
    
    // Find the user
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return [];
    }
    
    // If the user has custom dashboard sections, return those
    if (user.customDashboardSections && user.customDashboardSections.length > 0) {
      return user.customDashboardSections;
    }
    
    // If the user has a subscription package, get the sections from there
    if (user.subscriptionPackage) {
      const packageData = await SubscriptionPackage.findOne({ id: user.subscriptionPackage });
      
      if (packageData && packageData.dashboardSections && packageData.dashboardSections.length > 0) {
        return packageData.dashboardSections;
      }
    }
    
    // Fallback to default sections based on user role
    return getDashboardSectionsByRole(user.role || 'Business');
  } catch (error) {
    console.error('Error getting user dashboard sections:', error);
    return [];
  }
};

// Update user's custom dashboard sections
export const updateUserDashboardSections = async (userId: string, sections: string[]): Promise<boolean> => {
  try {
    await connectToMongoDB();
    
    const result = await User.findOneAndUpdate(
      { uid: userId },
      { $set: { customDashboardSections: sections } },
      { new: true }
    );
    
    return !!result;
  } catch (error) {
    console.error('Error updating user dashboard sections:', error);
    return false;
  }
};

// Update subscription package dashboard sections
export const updatePackageDashboardSections = async (packageId: string, sections: string[]): Promise<boolean> => {
  try {
    await connectToMongoDB();
    
    const result = await SubscriptionPackage.findOneAndUpdate(
      { id: packageId },
      { $set: { dashboardSections: sections } },
      { new: true }
    );
    
    return !!result;
  } catch (error) {
    console.error('Error updating package dashboard sections:', error);
    return false;
  }
};
