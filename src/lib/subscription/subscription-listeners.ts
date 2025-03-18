
// This file needs updating to include paymentType
import { db } from "@/config/firebase";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";
import { SubscriptionData } from "./types";

// Add listener for subscription changes
export const listenToSubscriptionChanges = (userId: string, callback: (subscription: SubscriptionData | null) => void) => {
  if (!userId) return () => {};

  const path = `users/${userId}/subscription`;
  const docRef = doc(db, path);
  
  return onSnapshot(docRef, 
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SubscriptionData);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to subscription changes:", error);
      callback(null);
    }
  );
};

// Create a mock subscription for testing
export const createMockSubscription = async (userId: string, packageId: string, packageName: string, amount: number) => {
  try {
    const subscriptionData: SubscriptionData = {
      packageId: packageId,
      status: "active",
      startDate: new Date().toISOString(),
      userId: userId,
      packageName: packageName,
      amount: amount,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      advancePaymentMonths: 0,
      signupFee: 0,
      actualStartDate: new Date().toISOString(),
      isPaused: false,
      isPausable: false,
      isUserCancellable: false,
      invoiceIds: [],
      paymentType: "recurring" // Default to recurring for mock subscriptions
    };
    
    const path = `users/${userId}/subscription`;
    const docRef = doc(db, path);
    await setDoc(docRef, subscriptionData);
    
    return true;
  } catch (error) {
    console.error("Error creating mock subscription:", error);
    return false;
  }
};
