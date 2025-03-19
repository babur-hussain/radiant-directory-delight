
import { getUserSubscription } from './get-subscription';

/**
 * Listen to subscription changes for a specific user
 * @param userId The user ID to listen for subscription changes
 * @param callback Function to call when subscription changes
 * @returns Unsubscribe function
 */
export const listenToUserSubscription = (userId: string, callback: (subscription: any) => void) => {
  if (!userId) {
    console.error("No user ID provided to listenToUserSubscription");
    return () => {};
  }
  
  try {
    // Get initial data
    getUserSubscription(userId)
      .then(subscription => {
        if (subscription) {
          callback(subscription);
        }
      })
      .catch(error => {
        console.error("Error fetching initial subscription:", error);
      });
    
    // Note: In MongoDB-only setup, we don't have real-time listeners like Firestore
    // So we'll use polling instead
    const pollingInterval = setInterval(async () => {
      try {
        const subscription = await getUserSubscription(userId);
        callback(subscription);
      } catch (error) {
        console.error("Error in subscription polling:", error);
      }
    }, 60000); // Poll every 60 seconds
    
    // Return a function to clear the polling interval
    return () => {
      clearInterval(pollingInterval);
    };
  } catch (error) {
    console.error("Error setting up subscription listener:", error);
    return () => {};
  }
};
