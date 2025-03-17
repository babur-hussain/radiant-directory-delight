
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
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
    // First get initial data
    getUserSubscription(userId)
      .then(subscription => {
        if (subscription) {
          callback(subscription);
        }
      })
      .catch(error => {
        console.error("Error fetching initial subscription:", error);
      });
    
    // Then set up real-time listener for Firebase
    const userDocRef = doc(db, 'subscriptions', userId);
    
    return onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const subscriptionData = docSnapshot.data();
        console.log("Subscription updated in real-time:", subscriptionData);
        callback(subscriptionData);
      } else {
        console.log("No subscription found for this user in real-time listener");
        callback(null);
      }
    }, (error) => {
      console.error("Error in subscription listener:", error);
    });
  } catch (error) {
    console.error("Error setting up subscription listener:", error);
    return () => {};
  }
};
