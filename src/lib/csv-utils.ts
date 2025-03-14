
import { businessesData } from '@/data/businessesData';

// Define the business type based on the existing data structure
export interface Business {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  address: string;
  phone: string;
  description: string;
  featured: boolean;
  tags: string[];
}

// Store the uploaded businesses in this array
// This is a simple in-memory storage for demonstration
// In a real app, this would be stored in a database
export let uploadedBusinesses: Business[] = [];

// Default image to use when business image is unavailable
export const DEFAULT_BUSINESS_IMAGE = "https://source.unsplash.com/photo-1518770660439-4636190af475";

// Add event listeners for data updates
const dataChangeListeners: (() => void)[] = [];

export const addDataChangeListener = (listener: () => void) => {
  dataChangeListeners.push(listener);
};

export const removeDataChangeListener = (listener: () => void) => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

export const notifyDataChanged = () => {
  dataChangeListeners.forEach(listener => listener());
};

export const getAllBusinesses = (): Business[] => {
  // Combine the original businesses with the uploaded ones
  return [...businessesData, ...uploadedBusinesses];
};

// Add a new business manually
export const addBusiness = (business: Omit<Business, "id">): Business => {
  // Generate a new ID
  const lastBusinessId = Math.max(
    ...businessesData.map(b => b.id), 
    ...uploadedBusinesses.map(b => b.id), 
    0
  );
  
  const newBusiness: Business = {
    ...business,
    id: lastBusinessId + 1
  };
  
  uploadedBusinesses.push(newBusiness);
  notifyDataChanged();
  
  return newBusiness;
};

// Edit an existing business
export const updateBusiness = (updatedBusiness: Business): Business | null => {
  // Check if it's in the uploadedBusinesses array
  const index = uploadedBusinesses.findIndex(b => b.id === updatedBusiness.id);
  
  if (index !== -1) {
    // Update the business in the uploaded businesses array
    uploadedBusinesses[index] = updatedBusiness;
    notifyDataChanged();
    return updatedBusiness;
  }
  
  // We can't update businesses from the original dataset in this demo
  // In a real app with a database, you would update any business
  return null;
};

// Delete a business
export const deleteBusiness = (id: number): boolean => {
  const initialLength = uploadedBusinesses.length;
  uploadedBusinesses = uploadedBusinesses.filter(b => b.id !== id);
  
  const deleted = initialLength > uploadedBusinesses.length;
  
  if (deleted) {
    notifyDataChanged();
  }
  
  return deleted;
};

export const processCsvData = async (csvContent: string): Promise<{ 
  success: boolean; 
  businesses: Business[]; 
  message: string;
}> => {
  try {
    // Parse CSV content
    const lines = csvContent.split('\n');
    
    // Check if file is empty
    if (lines.length <= 1) {
      return { 
        success: false, 
        businesses: [], 
        message: "The CSV file is empty or contains only headers." 
      };
    }
    
    // Get headers
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['name', 'category', 'address', 'review', 'mobile'];
    const missingHeaders = requiredHeaders.filter(required => 
      !headers.some(header => header.includes(required))
    );
    
    if (missingHeaders.length > 0) {
      return { 
        success: false, 
        businesses: [], 
        message: `Missing required columns: ${missingHeaders.join(', ')}. Please ensure your CSV includes columns for Business Name, Category, Address, Review, and Mobile Number.` 
      };
    }
    
    // Process rows
    const businesses: Business[] = [];
    let lastBusinessId = Math.max(...businessesData.map(b => b.id), ...uploadedBusinesses.map(b => b.id), 0);
    
    // Start from index 1 to skip headers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Split the line into values
      // This is a simple split by comma, but in a real app,
      // you'd need to handle more complex CSV parsing (quotes, commas in values, etc.)
      const values = line.split(',').map(value => value.trim());
      
      // Get the index for each required field based on headers
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const categoryIndex = headers.findIndex(h => h.includes('category'));
      const addressIndex = headers.findIndex(h => h.includes('address'));
      const reviewIndex = headers.findIndex(h => h.includes('review'));
      const mobileIndex = headers.findIndex(h => h.includes('mobile'));
      
      // Validate if all fields are present in this row
      if (values.length < Math.max(nameIndex, categoryIndex, addressIndex, reviewIndex, mobileIndex) + 1) {
        return { 
          success: false, 
          businesses: [], 
          message: `Row ${i} is missing one or more required fields. Please check your CSV format.` 
        };
      }
      
      // Create a business object
      const business: Business = {
        id: ++lastBusinessId,
        name: values[nameIndex],
        category: values[categoryIndex],
        address: values[addressIndex],
        phone: values[mobileIndex],
        rating: parseFloat(values[reviewIndex]) || 0,
        reviews: Math.floor(Math.random() * 500) + 50, // Random number for demonstration
        image: `https://source.unsplash.com/random/500x350/?${values[categoryIndex].toLowerCase().replace(/\s+/g, ',')}`,
        description: `${values[nameIndex]} is a ${values[categoryIndex]} business located in ${values[addressIndex]}.`,
        featured: Math.random() > 0.8, // 20% chance of being featured
        tags: [values[categoryIndex], "New", "Imported"]
      };
      
      businesses.push(business);
    }
    
    // Add businesses to the uploadedBusinesses array
    uploadedBusinesses = [...uploadedBusinesses, ...businesses];
    
    // Notify listeners that data has changed
    notifyDataChanged();
    
    return { 
      success: true, 
      businesses, 
      message: `Successfully processed ${businesses.length} businesses.` 
    };
  } catch (error) {
    console.error("CSV processing error:", error);
    return { 
      success: false, 
      businesses: [], 
      message: `Error processing CSV: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
