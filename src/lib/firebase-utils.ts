
import axios from 'axios';
import { Business } from "./csv-utils";
import { SubscriptionPackage } from "@/data/subscriptionData";

/**
 * Fetches all subscription packages from MongoDB
 */
export async function fetchSubscriptionPackages(): Promise<SubscriptionPackage[]> {
  try {
    console.log("Fetching subscription packages from MongoDB");
    
    const response = await axios.get('http://localhost:3001/api/subscription-packages');
    const packages = response.data;
    
    console.log(`Retrieved ${packages.length} subscription packages`);
    
    return packages.map((pkg: any) => ({
      ...pkg,
      // Ensure all required fields are present
      title: pkg.title || "",
      price: pkg.price || 0,
      setupFee: pkg.setupFee || 0,
      durationMonths: pkg.durationMonths || 12,
      shortDescription: pkg.shortDescription || "",
      fullDescription: pkg.fullDescription || "",
      features: Array.isArray(pkg.features) ? pkg.features : [],
      popular: !!pkg.popular,
      type: pkg.type || "Business",
      termsAndConditions: pkg.termsAndConditions || ""
    }));
  } catch (error) {
    console.error("Error fetching subscription packages:", error);
    throw error;
  }
}

/**
 * Fetches all businesses from MongoDB
 */
export async function fetchBusinesses(): Promise<Business[]> {
  try {
    console.log("Fetching businesses from MongoDB");
    
    const response = await axios.get('http://localhost:3001/api/businesses');
    const businesses = response.data;
    
    console.log(`Retrieved ${businesses.length} businesses`);
    
    return businesses.map((business: any) => ({
      id: Number(business.id),
      name: business.name || "",
      description: business.description || "",
      category: business.category || "",
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
      rating: business.rating || 0,
      reviews: business.reviews || 0,
      latitude: business.latitude || 0,
      longitude: business.longitude || 0,
      hours: business.hours || {},
      tags: Array.isArray(business.tags) ? business.tags : [],
      featured: !!business.featured,
      image: business.image || ""
    }));
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

/**
 * Creates or updates a subscription package in MongoDB
 */
export async function saveSubscriptionPackage(packageData: SubscriptionPackage): Promise<void> {
  try {
    console.log("Saving subscription package to MongoDB:", packageData);
    
    // Validate required fields
    if (!packageData.id) {
      throw new Error("Package ID is required");
    }
    
    if (!packageData.title) {
      throw new Error("Package title is required");
    }
    
    await axios.post('http://localhost:3001/api/subscription-packages', packageData);
    
    console.log("Subscription package saved successfully with ID:", packageData.id);
  } catch (error) {
    console.error("Error saving subscription package:", error);
    throw error;
  }
}

/**
 * Deletes a subscription package from MongoDB
 */
export async function deleteSubscriptionPackage(packageId: string): Promise<void> {
  try {
    console.log("Deleting subscription package with ID:", packageId);
    await axios.delete(`http://localhost:3001/api/subscription-packages/${packageId}`);
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
    console.log(`Fetching ${type} subscription packages from MongoDB`);
    
    const response = await axios.get(`http://localhost:3001/api/subscription-packages?type=${type}`);
    const packages = response.data;
    
    console.log(`Retrieved ${packages.length} ${type} packages`);
    
    // Sort packages by price in ascending order
    return packages.sort((a: any, b: any) => a.price - b.price);
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
}

/**
 * Saves a business to MongoDB
 */
export async function saveBusiness(business: Business): Promise<void> {
  try {
    console.log("Saving business to MongoDB:", business);
    
    // Validate required fields
    if (!business.name) {
      throw new Error("Business name is required");
    }
    
    await axios.post('http://localhost:3001/api/businesses', business);
    
    console.log("Business saved successfully with ID:", business.id);
  } catch (error) {
    console.error("Error saving business:", error);
    throw error;
  }
}

/**
 * Deletes a business from MongoDB
 */
export async function deleteBusiness(businessId: number): Promise<void> {
  try {
    console.log("Deleting business with ID:", businessId);
    await axios.delete(`http://localhost:3001/api/businesses/${businessId}`);
    console.log("Business deleted successfully");
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}
