
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";

/**
 * Set up a real-time listener for a user's subscription
 */
export const listenToUserSubscription = (
  userId: string,
  onUpdate: (subscription: SubscriptionData | null) => void,
  onError: (error: any) => void
) => {
  if (!userId) return () => {};
  
  // Listen to the user document for subscription changes
  const userRef = doc(db, "users", userId);
  const unsubscribe = onSnapshot(userRef, 
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData?.subscription) {
          onUpdate(userData.subscription as SubscriptionData);
        } else if (userData?.subscriptionStatus) {
          // Handle legacy format
          const subscription: SubscriptionData = {
            packageId: userData.subscriptionPackage,
            status: userData.subscriptionStatus,
            startDate: userData.subscriptionAssignedAt 
              ? new Date(userData.subscriptionAssignedAt.toDate()).toISOString() 
              : new Date().toISOString(),
            userId: userId,
            packageName: "Legacy Package",
            amount: 0,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            // Add default values for required fields
            advancePaymentMonths: 0,
            signupFee: 0,
            actualStartDate: new Date().toISOString(),
            isPaused: false,
            isPausable: false,
            isUserCancellable: false, // Set to false to ensure users cannot cancel
            invoiceIds: []
          };
          onUpdate(subscription);
        } else {
          onUpdate(null);
        }
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error listening to user subscription:", error);
      onError(error);
    }
  );
  
  return unsubscribe;
};
