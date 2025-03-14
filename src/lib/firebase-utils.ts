import { db } from "@/config/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { Business } from "./csv-utils";

const SUBSCRIPTION_COLLECTION = "subscriptionPackages";
const BUSINESSES_COLLECTION = "businesses";

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
    
    // If no packages found, this could be a permission issue or just no data
    if (snapshot.docs.length === 0) {
      console.warn("No subscription packages found. This could be due to missing data or insufficient permissions.");
    }
    
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
    
    // Check for permission-related errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Look for various permission error patterns
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      console.error("Permission denied when accessing subscription packages. Please check your Firebase security rules.");
      throw new Error("Permission denied. You don't have admin rights to view subscription packages.");
    }
    
    throw error;
  }
}

/**
 * Fetches all businesses from Firebase
 */
export async function fetchBusinesses(): Promise<Business[]> {
  try {
    console.log("Fetching businesses from collection:", BUSINESSES_COLLECTION);
    
    // Create a query to get all businesses 
    const businessesQuery = query(
      collection(db, BUSINESSES_COLLECTION),
      orderBy("name", "asc")
    );
    
    // Execute the query
    const snapshot = await getDocs(businessesQuery);
    console.log(`Retrieved ${snapshot.docs.length} businesses from Firebase`);
    
    // Map the document data to our Business type
    const businesses = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: Number(doc.id) || parseInt(doc.id, 10),
        name: data.name || "",
        description: data.description || "",
        category: data.category || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        hours: data.hours || {},
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: !!data.featured,
        image: data.image || ""
      } as Business;
    });
    
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses from Firebase:", error);
    
    // Check for permission-related errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      console.error("Permission denied when accessing businesses. Please check your Firebase security rules.");
      throw new Error("Permission denied. You don't have access to view businesses.");
    }
    
    throw error;
  }
}

/**
 * Creates or updates a subscription package in Firebase
 */
export async function saveSubscriptionPackage(packageData: SubscriptionPackage): Promise<void> {
  try {
    console.log("Saving subscription package:", packageData);
    
    // Validate required fields before saving
    if (!packageData.id) {
      throw new Error("Package ID is required");
    }
    
    if (!packageData.title) {
      throw new Error("Package title is required");
    }
    
    // Make sure we have proper type conversion for numeric fields
    const sanitizedPackage = {
      ...packageData,
      price: Number(packageData.price),
      setupFee: Number(packageData.setupFee),
      durationMonths: Number(packageData.durationMonths),
      popular: Boolean(packageData.popular)
    };
    
    // Create a reference to the document
    const packageRef = doc(db, SUBSCRIPTION_COLLECTION, packageData.id);
    
    // Save the document
    await setDoc(packageRef, sanitizedPackage);
    console.log("Subscription package saved successfully with ID:", packageData.id);
  } catch (error) {
    console.error("Error saving subscription package:", error);
    console.error("Package data that failed:", JSON.stringify(packageData, null, 2));
    
    // Check for permission-related errors more comprehensively
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      throw new Error("Permission denied. You don't have admin rights to create or update subscription packages.");
    }
    
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
    
    // Check for permission-related errors more comprehensively
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      throw new Error("Permission denied. You don't have admin rights to delete subscription packages.");
    }
    
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
    
    // Check for permission-related errors more comprehensively
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      console.error("Permission denied when accessing subscription packages. Please check your Firebase security rules.");
      throw new Error("Permission denied. You don't have access to view subscription packages.");
    }
    
    throw error;
  }
}

/**
 * Saves a business to Firebase
 */
export async function saveBusiness(business: Business): Promise<void> {
  try {
    console.log("Saving business to Firebase:", business);
    
    // Validate required fields
    if (!business.name) {
      throw new Error("Business name is required");
    }
    
    // Convert id to string for Firestore (Firestore document IDs are strings)
    const businessId = String(business.id);
    const businessRef = doc(db, BUSINESSES_COLLECTION, businessId);
    
    await setDoc(businessRef, {
      ...business,
      // Ensure numeric fields are stored as numbers
      rating: Number(business.rating),
      reviews: Number(business.reviews),
      latitude: Number(business.latitude || 0),
      longitude: Number(business.longitude || 0),
      // Ensure boolean fields are stored as booleans
      featured: Boolean(business.featured)
    });
    
    console.log("Business saved successfully with ID:", businessId);
  } catch (error) {
    console.error("Error saving business:", error);
    
    // Check for permission-related errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      throw new Error("Permission denied. You don't have admin rights to create or update businesses.");
    }
    
    throw error;
  }
}

/**
 * Deletes a business from Firebase
 */
export async function deleteBusiness(businessId: number): Promise<void> {
  try {
    console.log("Deleting business with ID:", businessId);
    const documentId = String(businessId);
    const businessRef = doc(db, BUSINESSES_COLLECTION, documentId);
    await deleteDoc(businessRef);
    console.log("Business deleted successfully");
  } catch (error) {
    console.error("Error deleting business:", error);
    
    // Check for permission-related errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions") ||
        errorMessage.includes("Missing or insufficient permissions")) {
      throw new Error("Permission denied. You don't have admin rights to delete businesses.");
    }
    
    throw error;
  }
}
