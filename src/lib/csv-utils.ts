import { businessesData } from '@/data/businessesData';
import { db } from '@/config/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  writeBatch
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  priority?: number; // Added priority field (optional)
  latitude?: number; // Added latitude field
  longitude?: number; // Added longitude field
  email?: string; // Added email field
  website?: string; // Added website field
  hours?: Record<string, any>; // Added hours field
}

// Default business data to use when Firebase data is unavailable
export const DEFAULT_BUSINESSES_DATA: Business[] = [
  {
    id: 1,
    name: "The Coffee Hub",
    category: "Coffee Shop",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    reviews: 230,
    address: "123 Main St, Portland, OR",
    phone: "(503) 555-1234",
    description: "A cozy coffee shop with a wide selection of specialty drinks and pastries. Free WiFi and plenty of seating make it perfect for remote work or casual meetings.",
    featured: true,
    tags: ["Coffee", "Breakfast", "WiFi", "Pastries"]
  },
  {
    id: 2,
    name: "Green Leaf Restaurant",
    category: "Restaurant",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    reviews: 187,
    address: "456 Park Ave, Portland, OR",
    phone: "(503) 555-5678",
    description: "Farm-to-table restaurant focusing on locally sourced ingredients and seasonal menus. Known for innovative dishes and warm, inviting atmosphere.",
    featured: true,
    tags: ["Dinner", "Lunch", "Organic", "Local"]
  },
  {
    id: 3,
    name: "Fitness First Gym",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    reviews: 156,
    address: "789 Fitness Way, Portland, OR",
    phone: "(503) 555-9012",
    description: "Modern gym with state-of-the-art equipment, personal training, and group fitness classes. Open 24/7 with monthly and annual membership options.",
    featured: false,
    tags: ["Gym", "Personal Training", "24/7", "Classes"]
  },
  {
    id: 4,
    name: "City Bookstore",
    category: "Retail",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Ym9va3N0b3JlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.9,
    reviews: 203,
    address: "321 Book Lane, Portland, OR",
    phone: "(503) 555-3456",
    description: "Independent bookstore with a curated selection of books, magazines, and gifts. Hosts author events and book clubs throughout the year.",
    featured: true,
    tags: ["Books", "Gifts", "Events", "Local"]
  },
  {
    id: 5,
    name: "Tech Solutions",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.2,
    reviews: 78,
    address: "555 Tech Blvd, Portland, OR",
    phone: "(503) 555-7890",
    description: "Computer repair, IT consulting, and tech support for individuals and small businesses. Certified technicians and quick turnaround times.",
    featured: false,
    tags: ["Tech Support", "Repairs", "Consulting", "IT Services"]
  },
  {
    id: 6,
    name: "Fresh Cuts Salon",
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8aGFpcnNhbG9ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    reviews: 112,
    address: "888 Beauty Lane, Portland, OR",
    phone: "(503) 555-2345",
    description: "Full-service hair salon offering cuts, color, and styling for all hair types. Expert stylists and a relaxing atmosphere.",
    featured: true,
    tags: ["Hair", "Beauty", "Color", "Styling"]
  }
];

// Firestore collection name
const BUSINESSES_COLLECTION = 'businesses';

// Store the uploaded businesses in this array (in-memory cache)
export let uploadedBusinesses: Business[] = [];
let isUsingDefaultData = false;

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

// Initialize data by loading from Firestore
export const initializeData = async (): Promise<void> => {
  try {
    const businessesCollection = collection(db, BUSINESSES_COLLECTION);
    const businessesQuery = query(businessesCollection, orderBy('id', 'asc'));
    const snapshot = await getDocs(businessesQuery);
    
    // Clear the current array
    uploadedBusinesses = [];
    isUsingDefaultData = false;
    
    // Add each business from Firestore to the array
    snapshot.forEach(doc => {
      const businessData = doc.data() as Business;
      businessData.id = Number(businessData.id); // Ensure ID is a number
      
      // Add the Firestore document ID as a property for later use
      (businessData as any).docId = doc.id;
      
      uploadedBusinesses.push(businessData);
    });

    // If no businesses were loaded from Firestore, check if we should use default data
    if (uploadedBusinesses.length === 0 && businessesData.length === 0) {
      console.warn("No businesses found in Firestore and businessesData is empty. Using default business data.");
      isUsingDefaultData = true;
    }
    
    notifyDataChanged();
  } catch (error) {
    console.error("Error initializing data from Firestore:", error);
    
    // Check for permission issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("permission-denied") || 
        errorMessage.includes("Permission denied") ||
        errorMessage.includes("insufficient permissions")) {
      console.warn("Permission denied when accessing businesses. Using default business data.");
      isUsingDefaultData = true;
      
      // Display a toast notification if available
      try {
        const event = new CustomEvent('businessPermissionError', {
          detail: { message: "Permission denied when accessing businesses. Using default business data." }
        });
        window.dispatchEvent(event);
      } catch (e) {
        console.error("Failed to dispatch permission error event:", e);
      }
    }
    
    notifyDataChanged();
  }
};

// Call initialize immediately to load data
initializeData();

export const getAllBusinesses = (): Business[] => {
  // If we're using default data due to permission issues or no data
  if (isUsingDefaultData) {
    return DEFAULT_BUSINESSES_DATA;
  }
  
  // If businessesData has content, use it as the base
  if (businessesData.length > 0) {
    // Combine the original businesses with the uploaded ones
    const allBusinesses = [...businessesData, ...uploadedBusinesses];
    
    // Sort businesses by priority (lower numbers first)
    // Businesses without priority (undefined) will be after those with priority
    return allBusinesses.sort((a, b) => {
      // If both have priority, compare them (ASCENDING order - lower numbers first)
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      // If only a has priority, a comes first
      if (a.priority !== undefined) {
        return -1;
      }
      // If only b has priority, b comes first
      if (b.priority !== undefined) {
        return 1;
      }
      // If neither has priority, maintain the original order (featured businesses first)
      return b.featured === a.featured ? 0 : b.featured ? 1 : -1;
    });
  }
  
  // If businessesData is empty but we have uploaded businesses, just return those
  if (uploadedBusinesses.length > 0) {
    // Sort uploaded businesses by priority
    return uploadedBusinesses.sort((a, b) => {
      // If both have priority, compare them (ASCENDING order - lower numbers first)
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      // If only a has priority, a comes first
      if (a.priority !== undefined) {
        return -1;
      }
      // If only b has priority, b comes first
      if (b.priority !== undefined) {
        return 1;
      }
      // If neither has priority, maintain the original order
      return 0;
    });
  }
  
  // If no data anywhere, return default data
  return DEFAULT_BUSINESSES_DATA;
};

// Add a new business manually
export const addBusiness = async (business: Omit<Business, "id">): Promise<Business> => {
  try {
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
    
    // Add to Firestore
    const businessesCollection = collection(db, BUSINESSES_COLLECTION);
    const docRef = await addDoc(businessesCollection, newBusiness);
    
    // Add docId for later reference
    (newBusiness as any).docId = docRef.id;
    
    // Add to local array
    uploadedBusinesses.push(newBusiness);
    notifyDataChanged();
    
    return newBusiness;
  } catch (error) {
    console.error("Error adding business to Firestore:", error);
    throw error;
  }
};

// Update an existing business
export const updateBusiness = async (updatedBusiness: Business): Promise<Business | null> => {
  try {
    // Check if it's in the uploadedBusinesses array
    const index = uploadedBusinesses.findIndex(b => b.id === updatedBusiness.id);
    
    if (index !== -1) {
      // Get the document ID
      const docId = (uploadedBusinesses[index] as any).docId;
      
      if (!docId) {
        console.error("No document ID found for business:", updatedBusiness);
        return null;
      }
      
      // Update in Firestore
      const businessRef = doc(db, BUSINESSES_COLLECTION, docId);
      await updateDoc(businessRef, { ...updatedBusiness });
      
      // Update the business in the uploaded businesses array
      uploadedBusinesses[index] = updatedBusiness;
      (uploadedBusinesses[index] as any).docId = docId;
      
      // Force a re-sort by notifying data changed
      notifyDataChanged();
      return updatedBusiness;
    }
    
    // We can't update businesses from the original dataset in this demo
    // In a real app with a database, you would update any business
    return null;
  } catch (error) {
    console.error("Error updating business in Firestore:", error);
    return null;
  }
};

// Delete a business
export const deleteBusiness = async (id: number): Promise<boolean> => {
  try {
    const initialLength = uploadedBusinesses.length;
    const businessToDelete = uploadedBusinesses.find(b => b.id === id);
    
    if (businessToDelete) {
      const docId = (businessToDelete as any).docId;
      
      if (!docId) {
        console.error("No document ID found for business with ID:", id);
        return false;
      }
      
      // Delete from Firestore
      const businessRef = doc(db, BUSINESSES_COLLECTION, docId);
      await deleteDoc(businessRef);
    }
    
    // Update local array
    uploadedBusinesses = uploadedBusinesses.filter(b => b.id !== id);
    
    const deleted = initialLength > uploadedBusinesses.length;
    
    if (deleted) {
      notifyDataChanged();
    }
    
    return deleted;
  } catch (error) {
    console.error("Error deleting business from Firestore:", error);
    return false;
  }
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
    
    try {
      // Batch write to Firestore for better performance
      const batch = writeBatch(db);
      const businessesCollection = collection(db, BUSINESSES_COLLECTION);
      
      // Add each business to the batch
      for (const business of businesses) {
        const docRef = doc(businessesCollection);
        batch.set(docRef, business);
        
        // Store the document ID for later reference
        (business as any).docId = docRef.id;
      }
      
      // Commit the batch
      await batch.commit();
      
      // Update the local array after successful Firestore write
      uploadedBusinesses = [...uploadedBusinesses, ...businesses];
      
      // Notify listeners that data has changed
      notifyDataChanged();
      
      return { 
        success: true, 
        businesses, 
        message: `Successfully processed ${businesses.length} businesses.` 
      };
    } catch (firestoreError) {
      console.error("Error saving to Firestore:", firestoreError);
      return { 
        success: false, 
        businesses: [], 
        message: `Error saving to database: ${firestoreError instanceof Error ? firestoreError.message : String(firestoreError)}` 
      };
    }
  } catch (error) {
    console.error("CSV processing error:", error);
    return { 
      success: false, 
      businesses: [], 
      message: `Error processing CSV: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Add this function to generate a unique ID for a new business
export const generateUniqueId = async (): Promise<number> => {
  const businesses = getAllBusinesses();
  const highestId = businesses.reduce((maxId, business) => {
    return Math.max(maxId, business.id);
  }, 0);
  
  return highestId + 1;
};
