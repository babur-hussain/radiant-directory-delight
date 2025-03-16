
import { User } from '../../models/User';
import { Subscription, ISubscription } from '../../models/Subscription';

/**
 * Gets a user's current subscription from MongoDB
 */
export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Get user document to check for subscription summary
    const user = await User.findOne({ uid: userId });
    
    if (user) {
      // Check for subscription in user document
      if (user.subscription) {
        console.log("✅ Found subscription in user document:", user.subscription);
        
        // Get the full subscription details
        const subscription = await Subscription.findOne({ id: user.subscription });
        if (subscription) {
          return subscription;
        }
      }
    }
    
    // If not found in user document, check subscriptions collection directly
    const activeSubscriptions = await Subscription.find({ 
      userId: userId,
      status: "active"
    }).sort({ createdAt: -1 });
    
    if (activeSubscriptions.length > 0) {
      // Get the most recent active subscription
      const latestSubscription = activeSubscriptions[0];
      console.log("✅ Found subscription in subscriptions collection:", latestSubscription);
      
      // Update user document with this subscription
      await User.findOneAndUpdate(
        { uid: userId },
        {
          subscription: latestSubscription.id,
          subscriptionStatus: latestSubscription.status,
          subscriptionPackage: latestSubscription.packageId,
          lastUpdated: new Date()
        }
      );
      
      return latestSubscription;
    }
    
    console.log("❌ No subscription found for user", userId);
    return null;
  } catch (error) {
    console.error("❌ Error getting user subscription:", error);
    return null;
  }
};
