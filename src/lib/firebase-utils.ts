
import { db } from "@/config/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { SubscriptionPackage } from "@/data/subscriptionData";

const SUBSCRIPTION_COLLECTION = "subscriptionPackages";

/**
 * Fetches all subscription packages from Firebase
 */
export async function fetchSubscriptionPackages(): Promise<SubscriptionPackage[]> {
  try {
    const packagesQuery = query(
      collection(db, SUBSCRIPTION_COLLECTION),
      orderBy("price", "asc")
    );
    const snapshot = await getDocs(packagesQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data() as SubscriptionPackage,
      id: doc.id
    }));
  } catch (error) {
    console.error("Error fetching subscription packages:", error);
    throw error;
  }
}

/**
 * Creates or updates a subscription package in Firebase
 */
export async function saveSubscriptionPackage(packageData: SubscriptionPackage): Promise<void> {
  try {
    const packageRef = doc(db, SUBSCRIPTION_COLLECTION, packageData.id);
    await setDoc(packageRef, packageData);
  } catch (error) {
    console.error("Error saving subscription package:", error);
    throw error;
  }
}

/**
 * Deletes a subscription package from Firebase
 */
export async function deleteSubscriptionPackage(packageId: string): Promise<void> {
  try {
    const packageRef = doc(db, SUBSCRIPTION_COLLECTION, packageId);
    await deleteDoc(packageRef);
  } catch (error) {
    console.error("Error deleting subscription package:", error);
    throw error;
  }
}
