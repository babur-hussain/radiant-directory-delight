
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '@/models/Business';

export interface Business {
  id: number;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, string>;
  tags?: string[];
  featured?: boolean;
  image?: string;
}

let businessesCache: Business[] = [];
const dataChangeListeners: Function[] = [];

// Function to initialize data from Supabase
export const initializeData = async (): Promise<void> => {
  try {
    console.log("Initializing business data from Supabase...");
    const { data, error } = await supabase.from('businesses').select('*');
    
    if (error) {
      throw error;
    }
    
    businessesCache = data as Business[];
    console.log(`Loaded ${businessesCache.length} businesses from Supabase`);
    notifyDataChangeListeners();
  } catch (error) {
    console.error("Error initializing data from Supabase:", error);
    businessesCache = [];
  }
};

// Generate a proper business ID within PostgreSQL integer range
// The ID should be between 1001 and 999999 to stay within safe integer range
const generateBusinessId = (): number => {
  // Generate a random number between 1001 and 99999
  return Math.floor(Math.random() * 98999) + 1001;
};

// Process CSV data and upload to Supabase
export const processCsvData = async (csvContent: string): Promise<{ success: boolean, businesses: Business[], message: string }> => {
  try {
    console.log("Processing CSV data...");
    
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers - map from common CSV headers to our database column names
        const headerMap: { [key: string]: string } = {
          "Business Name": "name",
          "BusinessName": "name",
          "Name": "name",
          "business_name": "name",
          "Category": "category",
          "category": "category",
          "Address": "address",
          "address": "address",
          "Mobile Number": "phone",
          "MobileNumber": "phone",
          "Phone": "phone",
          "phone": "phone",
          "Mobile": "phone",
          "Review": "rating",
          "Rating": "rating",
          "rating": "rating",
          "Description": "description",
          "description": "description",
          "Email": "email",
          "email": "email",
          "Website": "website",
          "website": "website",
          "Reviews": "reviews",
          "reviews": "reviews",
          "Image": "image",
          "image": "image",
          "Tags": "tags",
          "tags": "tags"
        };
        
        return headerMap[header] || header.toLowerCase();
      }
    });
    
    if (results.errors.length > 0) {
      console.error("CSV parsing errors:", results.errors);
      return { 
        success: false, 
        businesses: [], 
        message: `CSV parsing error: ${results.errors[0].message}` 
      };
    }
    
    console.log("CSV parsing result:", results);
    
    const businesses: Business[] = [];
    const failed: string[] = [];
    
    // Process in batches of 10 to avoid overwhelming the database
    const batchSize = 10;
    const totalRows = results.data.length;
    
    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = results.data.slice(i, i + batchSize);
      const batchBusinesses = [];
      
      for (const row of batch as any[]) {
        try {
          // Validate the only required field - name
          if (!row.name || row.name.trim() === '') {
            console.warn("Skipping row without business name:", row);
            continue;
          }
          
          // Parse rating value from string to number
          let rating = 0;
          if (row.rating) {
            // Handle rating that might be a string with stars or just a number
            const ratingValue = row.rating.toString().replace(/[^0-9.]/g, '');
            rating = parseFloat(ratingValue) || 0;
            // Limit rating to 5 stars max
            rating = Math.min(rating, 5);
          }
          
          // Generate a safe integer ID
          const safeId = generateBusinessId();
          
          // Process tags
          let tags = row.tags || [];
          if (typeof tags === 'string') {
            tags = tags.split(',').map((tag: string) => tag.trim());
          } else if (!Array.isArray(tags)) {
            tags = row.category ? [row.category] : [];
          }
          
          // Create business object with a smaller ID that fits within PostgreSQL integer limits
          const business: Business = {
            id: safeId,
            name: row.name.trim(),
            category: row.category || "",
            description: row.description || `${row.name} is a business in the ${row.category || "various"} category.`,
            address: row.address || "",
            phone: row.phone || "",
            email: row.email || "",
            website: row.website || "",
            rating: rating,
            reviews: parseInt(row.reviews) || Math.floor(Math.random() * 100) + 5,
            latitude: parseFloat(row.latitude) || 0,
            longitude: parseFloat(row.longitude) || 0,
            tags: tags,
            featured: row.featured === "true" || row.featured === true,
            image: row.image || `/placeholder-${Math.floor(Math.random() * 5) + 1}.jpg`
          };
          
          batchBusinesses.push(business);
        } catch (rowError) {
          console.error("Error processing CSV row:", rowError);
        }
      }
      
      if (batchBusinesses.length > 0) {
        try {
          // Insert the batch into Supabase
          const { data, error } = await supabase.from('businesses').insert(batchBusinesses);
          
          if (error) {
            console.error("Error inserting batch to Supabase:", error);
            // If the batch fails, try to insert businesses one by one
            for (const business of batchBusinesses) {
              try {
                console.log("Saving business to Supabase:", business.name);
                const { error: singleError } = await supabase.from('businesses').insert([business]);
                
                if (singleError) {
                  console.error("Error inserting business to Supabase:", singleError);
                  failed.push(business.name);
                } else {
                  businesses.push(business);
                }
              } catch (singleInsertError) {
                console.error("Error during single business insert:", singleInsertError);
                failed.push(business.name);
              }
            }
          } else {
            // Add all businesses in the batch to our successful list
            businesses.push(...batchBusinesses);
          }
        } catch (batchError) {
          console.error("Error inserting batch to Supabase:", batchError);
          // Mark all businesses in this batch as failed
          failed.push(...batchBusinesses.map(b => b.name));
        }
      }
    }
    
    // Update the cache after successfully saving to Supabase
    if (businesses.length > 0) {
      // Refresh the entire cache from Supabase
      await initializeData();
    }
    
    let message = `Successfully processed ${businesses.length} businesses`;
    if (failed.length > 0) {
      message += `. Failed to insert ${failed.length} businesses.`;
    }
    
    return { 
      success: true, 
      businesses, 
      message 
    };
  } catch (error) {
    console.error("Error processing CSV data:", error);
    return { 
      success: false, 
      businesses: [], 
      message: `Error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Get all businesses from cache
export const getAllBusinesses = (): Business[] => {
  return [...businessesCache];
};

// Add a business
export const addBusiness = async (businessData: Partial<Business>): Promise<Business> => {
  try {
    // Generate a safe integer ID
    const businessId = businessData.id || generateBusinessId();
    
    // Create complete business object
    const business: Business = {
      id: businessId,
      name: businessData.name || "Unnamed Business",
      description: businessData.description || `${businessData.name} is a business in the ${businessData.category || "various"} category.`,
      category: businessData.category || "",
      address: businessData.address || "",
      phone: businessData.phone || "",
      email: businessData.email || "",
      website: businessData.website || "",
      rating: businessData.rating || 0,
      reviews: businessData.reviews || 0,
      latitude: businessData.latitude || 0,
      longitude: businessData.longitude || 0,
      hours: businessData.hours || {},
      tags: businessData.tags || [businessData.category || ""],
      featured: businessData.featured || false,
      image: businessData.image || `/placeholder-${Math.floor(Math.random() * 5) + 1}.jpg`
    };
    
    // Save to Supabase
    const { error } = await supabase.from('businesses').insert([business]);
    
    if (error) {
      throw error;
    }
    
    // Update cache
    businessesCache.push(business);
    notifyDataChangeListeners();
    
    return business;
  } catch (error) {
    console.error("Error adding business:", error);
    throw error;
  }
};

// Update an existing business
export const updateBusiness = async (businessData: Business): Promise<boolean> => {
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('businesses')
      .update(businessData)
      .eq('id', businessData.id);
    
    if (error) {
      throw error;
    }
    
    // Update cache
    const index = businessesCache.findIndex(b => b.id === businessData.id);
    if (index !== -1) {
      businessesCache[index] = businessData;
    } else {
      businessesCache.push(businessData);
    }
    
    notifyDataChangeListeners();
    return true;
  } catch (error) {
    console.error("Error updating business:", error);
    throw error;
  }
};

// Delete a business
export const deleteBusiness = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // Update cache
    businessesCache = businessesCache.filter(b => b.id !== id);
    notifyDataChangeListeners();
    return true;
  } catch (error) {
    console.error("Error deleting business:", error);
    return false;
  }
};

// Add a data change listener
export const addDataChangeListener = (listener: Function): void => {
  dataChangeListeners.push(listener);
};

// Remove a data change listener
export const removeDataChangeListener = (listener: Function): void => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

// Notify all listeners about data changes
const notifyDataChangeListeners = (): void => {
  for (const listener of dataChangeListeners) {
    listener();
  }
};
