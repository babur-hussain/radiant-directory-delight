
import { db } from "@/config/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { SubscriptionPackage } from "@/data/subscriptionData";

const SUBSCRIPTION_COLLECTION = "subscriptionPackages";

/**
 * Fetches all subscription packages from Firebase
 */
export async function fetchSubscriptionPackages(): Promise<SubscriptionPackage[]> {
  try {
    console.log("Fetching subscription packages from collection:", SUBSCRIPTION_COLLECTION);
    
    // Create a query to get all packages ordered by price
    const packagesQuery = query(
      collection(db, SUBSCRIPTION_COLLECTION),
      orderBy("price", "asc")
    );
    
    // Execute the query
    const snapshot = await getDocs(packagesQuery);
    console.log(`Retrieved ${snapshot.docs.length} subscription packages`);
    
    // Map the document data to our SubscriptionPackage type
    const packages = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log("Package data from Firebase:", doc.id, data);
      
      return {
        ...data as SubscriptionPackage,
        id: doc.id,
        // Ensure all required fields are present
        title: data.title || "",
        price: data.price || 0,
        setupFee: data.setupFee || 0,
        durationMonths: data.durationMonths || 12,
        shortDescription: data.shortDescription || "",
        fullDescription: data.fullDescription || "",
        features: Array.isArray(data.features) ? data.features : [],
        popular: !!data.popular,
        type: data.type || "Business",
        termsAndConditions: data.termsAndConditions || ""
      } as SubscriptionPackage;
    });
    
    return packages;
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
    console.log("Saving subscription package:", packageData);
    const packageRef = doc(db, SUBSCRIPTION_COLLECTION, packageData.id);
    await setDoc(packageRef, packageData);
    console.log("Subscription package saved successfully");
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
    console.log("Deleting subscription package with ID:", packageId);
    const packageRef = doc(db, SUBSCRIPTION_COLLECTION, packageId);
    await deleteDoc(packageRef);
    console.log("Subscription package deleted successfully");
  } catch (error) {
    console.error("Error deleting subscription package:", error);
    throw error;
  }
}

/**
 * Fetches subscription packages by type (Business or Influencer)
 */
export async function fetchSubscriptionPackagesByType(type: "Business" | "Influencer"): Promise<SubscriptionPackage[]> {
  try {
    console.log(`Fetching ${type} subscription packages`);
    
    const packagesQuery = query(
      collection(db, SUBSCRIPTION_COLLECTION),
      where("type", "==", type),
      orderBy("price", "asc")
    );
    
    const snapshot = await getDocs(packagesQuery);
    console.log(`Retrieved ${snapshot.docs.length} ${type} packages`);
    
    return snapshot.docs.map(doc => ({
      ...doc.data() as SubscriptionPackage,
      id: doc.id
    }));
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
}
