
import { getUserSubscription as fetchUserSubscription } from '../../api/mongoAPI';

/**
 * Gets a user's current subscription from MongoDB
 */
export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;
  
  try {
    console.log(`Getting subscription for user ${userId}`);
    const subscription = await fetchUserSubscription(userId);
    
    if (subscription) {
      console.log("✅ Found subscription:", subscription.id);
      return subscription;
    }
    
    console.log("❌ No subscription found for user", userId);
    return null;
  } catch (error) {
    console.error("❌ Error getting user subscription:", error);
    return null;
  }
};
