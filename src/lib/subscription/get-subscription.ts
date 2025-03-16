
import { User } from '../../models/User';
import { Subscription, ISubscription } from '../../models/Subscription';
import { connectToMongoDB } from '../../config/mongodb';

/**
 * Gets a user's current subscription from MongoDB
 */
export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // First ensure MongoDB is connected
    console.log(`Connecting to MongoDB to get subscription for user ${userId}`);
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error("Failed to connect to MongoDB in getUserSubscription");
      return null;
    }
    
    // Get user document to check for subscription summary
    const user = await User.findOne({ uid: userId });
    
    if (user) {
      // Check for subscription in user document
      if (user.subscription) {
        console.log("✅ Found subscription reference in user document:", user.subscription);
        
        // Get the full subscription details
        const subscription = await Subscription.findOne({ id: user.subscription });
        if (subscription) {
          console.log("✅ Found full subscription details:", subscription.id);
          return subscription;
        } else {
          console.log("⚠️ Subscription reference exists but no subscription document found");
        }
      }
    }
    
    // If not found in user document, check subscriptions collection directly
    console.log(`Looking for active subscriptions for user ${userId}`);
    const activeSubscriptions = await Subscription.find({ 
      userId: userId,
      status: "active"
    }).sort({ createdAt: -1 });
    
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      // Get the most recent active subscription
      const latestSubscription = activeSubscriptions[0];
      console.log("✅ Found subscription in subscriptions collection:", latestSubscription.id);
      
      // Update user document with this subscription
      console.log(`Updating user document with subscription ${latestSubscription.id}`);
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
