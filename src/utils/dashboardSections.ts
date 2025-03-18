
import { User } from '../models/User';
import { SubscriptionPackage } from '../models/SubscriptionPackage';
import { connectToMongoDB } from '../config/mongodb';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
  if (role === 'Business' || role.toLowerCase() === 'business') {
    return BUSINESS_DASHBOARD_SECTIONS;
  } else {
    return INFLUENCER_DASHBOARD_SECTIONS;
  }
};

// Get dashboard sections for a specific user
export const getUserDashboardSections = async (userId: string): Promise<string[]> => {
  if (!userId) {
    console.error('No user ID provided');
    return [];
  }
  
  try {
    // First try to get sections from Firebase
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
      
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        if (userData.customDashboardSections && Array.isArray(userData.customDashboardSections)) {
          console.log(`Found custom dashboard sections in Firebase for user ${userId}:`, userData.customDashboardSections);
          return userData.customDashboardSections;
        }
      }
    } catch (firebaseError) {
      console.error('Error getting user dashboard sections from Firebase:', firebaseError);
    }
    
    // Then try MongoDB
    try {
      await connectToMongoDB();
      
      // Find the user
      const user = await User.findOne({ uid: userId });
      
      if (!user) {
        console.error(`User with ID ${userId} not found in MongoDB`);
      } else {
        // If the user has custom dashboard sections, return those
        if (user.customDashboardSections && user.customDashboardSections.length > 0) {
          console.log(`Found custom dashboard sections in MongoDB for user ${userId}:`, user.customDashboardSections);
          return user.customDashboardSections;
        }
        
        // If the user has a subscription package, get the sections from there
        if (user.subscriptionPackage) {
          const packageData = await SubscriptionPackage.findOne({ id: user.subscriptionPackage });
          
          if (packageData && packageData.dashboardSections && packageData.dashboardSections.length > 0) {
            console.log(`Found dashboard sections from subscription package for user ${userId}:`, packageData.dashboardSections);
            return packageData.dashboardSections;
          }
        }
        
        // Return default sections based on user role
        const sections = getDashboardSectionsByRole(user.role || 'Business');
        console.log(`Using default sections based on role for user ${userId}:`, sections);
        return sections;
      }
    } catch (mongoError) {
      console.error('Error getting user dashboard sections from MongoDB:', mongoError);
    }
    
    // Fallback to default sections based on mock role
    // Use the last digit of userId to determine a mock role for testing
    const lastChar = userId.charAt(userId.length - 1);
    const mockRole = parseInt(lastChar) % 2 === 0 ? 'Business' : 'Influencer';
    const defaultSections = getDashboardSectionsByRole(mockRole);
    console.log(`Using fallback default sections for user ${userId}:`, defaultSections);
    return defaultSections;
    
  } catch (error) {
    console.error('Error getting user dashboard sections:', error);
    return getDashboardSectionsByRole('Business'); // Default fallback
  }
};

// Update user's custom dashboard sections
export const updateUserDashboardSections = async (userId: string, sections: string[]): Promise<boolean> => {
  if (!userId) {
    console.error('No user ID provided');
    return false;
  }
  
  let success = false;
  
  // First try to update in Firebase
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (userDocSnapshot.exists()) {
      await updateDoc(userDocRef, {
        customDashboardSections: sections
      });
      console.log(`Updated custom dashboard sections in Firebase for user ${userId}:`, sections);
      success = true;
    } else {
      await setDoc(userDocRef, {
        customDashboardSections: sections,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`Created custom dashboard sections in Firebase for user ${userId}:`, sections);
      success = true;
    }
  } catch (firebaseError) {
    console.error('Error updating user dashboard sections in Firebase:', firebaseError);
  }
  
  // Then try MongoDB
  if (!success) {
    try {
      await connectToMongoDB();
      
      const result = await User.findOneAndUpdate(
        { uid: userId },
        { $set: { customDashboardSections: sections } },
        { new: true }
      );
      
      if (result) {
        console.log(`Updated custom dashboard sections in MongoDB for user ${userId}:`, sections);
        success = true;
      }
    } catch (mongoError) {
      console.error('Error updating user dashboard sections in MongoDB:', mongoError);
    }
  }
  
  return success;
};

// Update subscription package dashboard sections
export const updatePackageDashboardSections = async (packageId: string, sections: string[]): Promise<boolean> => {
  if (!packageId) {
    console.error('No package ID provided');
    return false;
  }
  
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
