
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { csvHeaderMapping, getInverseHeaderMapping } from '@/models/Business';
import { toast } from '@/hooks/use-toast';

export interface Business {
  id: number;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  email?: string;
  website?: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Mock data for when we can't access the real database
let businessesData: Business[] = [];
let initialized = false;

// Initialize with default data
export const initializeData = async () => {
  if (initialized) return;
  
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convert the data to match our Business interface
    businessesData = data.map(business => ({
      ...business,
      // Ensure hours is converted from JSON string or Json type to Record<string, any>
      hours: business.hours ? 
        (typeof business.hours === 'string' ? 
          JSON.parse(business.hours) : 
          (typeof business.hours === 'object' ? business.hours : {})
        ) : {},
      // Ensure tags is an array
      tags: business.tags || []
    })) as Business[];
    
    initialized = true;
    
  } catch (error) {
    console.error("Error initializing data:", error);
    
    // Dispatch permission error if relevant
    if (error instanceof Error && error.message.includes('permission')) {
      const permissionErrorEvent = new CustomEvent('businessPermissionError', {
        detail: { message: error.message }
      });
      window.dispatchEvent(permissionErrorEvent);
    }
    
    // Init with empty data as fallback
    businessesData = [];
    initialized = true;
    throw error;
  }
};

// Event management
const dataChangeListeners: Array<() => void> = [];

export const addDataChangeListener = (listener: () => void) => {
  dataChangeListeners.push(listener);
};

export const removeDataChangeListener = (listener: () => void) => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

const notifyDataChanged = () => {
  dataChangeListeners.forEach(listener => listener());
};

// Get all businesses
export const getAllBusinesses = (): Business[] => {
  return [...businessesData];
};

// Delete business by ID
export const deleteBusiness = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    businessesData = businessesData.filter(business => business.id !== id);
    notifyDataChanged();
    return true;
  } catch (error) {
    console.error("Error deleting business:", error);
    return false;
  }
};

// Helper function to process CSV data
export const processCsvData = async (csvContent: string): Promise<{
  success: boolean;
  businesses: Business[];
  message: string;
}> => {
  try {
    // Parse CSV data
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      console.error("CSV parsing errors:", results.errors);
      return {
        success: false,
        businesses: [],
        message: `CSV parsing failed: ${results.errors[0].message}`
      };
    }

    const parsedData = results.data as Record<string, any>[];
    if (parsedData.length === 0) {
      return {
        success: false,
        businesses: [],
        message: "No data found in CSV file."
      };
    }
    
    console.log("Parsed CSV headers:", results.meta.fields);
    console.log("First row of CSV data:", parsedData[0]);

    // Process the data to match our business structure
    const processedBusinesses: Business[] = [];
    const processingErrors: string[] = [];
    let successCount = 0;

    // Process in batches for better performance
    const BATCH_SIZE = 25;
    let currentBatch: any[] = [];
    
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const processedBusiness = await processSingleBusiness(row, i);
      
      if (processedBusiness.success) {
        currentBatch.push(processedBusiness.business);
        processedBusinesses.push(processedBusiness.business);
        
        // Process a batch when it reaches the batch size or it's the last item
        if (currentBatch.length >= BATCH_SIZE || i === parsedData.length - 1) {
          if (currentBatch.length > 0) {
            const { success, errorMessage, successCount: batchSuccessCount } = 
              await saveBatchToSupabase(currentBatch);
            
            successCount += batchSuccessCount;
            
            if (!success && errorMessage) {
              processingErrors.push(errorMessage);
            }
          }
          
          // Reset batch
          currentBatch = [];
        }
      } else if (processedBusiness.errorMessage) {
        processingErrors.push(processedBusiness.errorMessage);
      }
    }

    // Save to our local data
    if (processedBusinesses.length > 0) {
      businessesData = [...businessesData, ...processedBusinesses];
      notifyDataChanged();
    }

    // Return results with appropriate message
    if (processingErrors.length > 0) {
      if (successCount === 0) {
        return {
          success: false,
          businesses: [],
          message: `Import failed: ${processingErrors.slice(0, 3).join(", ")}${processingErrors.length > 3 ? ` and ${processingErrors.length - 3} more errors` : ''}`
        };
      } else {
        return {
          success: true,
          businesses: processedBusinesses,
          message: `Imported ${successCount} businesses with ${processingErrors.length} errors`
        };
      }
    }

    return {
      success: true,
      businesses: processedBusinesses,
      message: `Successfully imported ${successCount} businesses`
    };
  } catch (error) {
    console.error("Error processing CSV data:", error);
    return {
      success: false,
      businesses: [],
      message: `Error processing CSV: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Process a single business row from CSV
const processSingleBusiness = async (
  row: Record<string, any>, 
  index: number
): Promise<{
  success: boolean;
  business?: Business;
  errorMessage?: string;
}> => {
  // Map CSV headers to our business fields
  const mappedBusiness: Record<string, any> = {};
  
  // Check for business name first since it's required
  let hasBusinessName = false;
  
  // Try all possible business name headers
  for (const possibleHeader of ["Business Name", "BusinessName", "Name", "business name", "business_name", "businessname", "name"]) {
    if (row[possibleHeader] && row[possibleHeader].trim() !== '') {
      mappedBusiness.name = row[possibleHeader].trim();
      hasBusinessName = true;
      break;
    }
  }
  
  // Skip if no business name found
  if (!hasBusinessName) {
    return {
      success: false,
      errorMessage: `Row ${index + 1}: Missing required "Business Name" field`
    };
  }
  
  // Map the rest of the fields
  for (const csvHeader in row) {
    // Skip empty values
    if (row[csvHeader] === undefined || row[csvHeader] === null || row[csvHeader] === '') {
      continue;
    }
    
    // Skip if we already processed the name
    if (mappedBusiness.name && (csvHeader === "Business Name" || csvHeader === "Name")) {
      continue;
    }
    
    const dbField = csvHeaderMapping[csvHeader];
    if (dbField) {
      mappedBusiness[dbField] = row[csvHeader];
    }
  }
  
  // Handle tags field (convert from CSV string to array)
  if (mappedBusiness.tags && typeof mappedBusiness.tags === 'string') {
    mappedBusiness.tags = mappedBusiness.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag !== '');
  } else {
    mappedBusiness.tags = [];
  }

  // Convert rating to a number
  if (mappedBusiness.rating) {
    const rating = parseFloat(mappedBusiness.rating);
    mappedBusiness.rating = isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  }

  // Convert reviews to a number
  if (mappedBusiness.reviews) {
    const reviews = parseInt(mappedBusiness.reviews, 10);
    mappedBusiness.reviews = isNaN(reviews) ? 0 : reviews;
  }
  
  // Default image if not provided
  if (!mappedBusiness.image && mappedBusiness.category) {
    mappedBusiness.image = `https://source.unsplash.com/random/500x350/?${mappedBusiness.category.toLowerCase().replace(/\s+/g, ",")}`;
  }

  // Create business object
  const business: Business = {
    ...mappedBusiness,
    id: 0, // Temporary ID, will be replaced by database
    name: mappedBusiness.name,
    category: mappedBusiness.category || '',
    rating: mappedBusiness.rating || 0,
    reviews: mappedBusiness.reviews || 0,
    tags: mappedBusiness.tags || [],
    featured: mappedBusiness.featured === 'true' || mappedBusiness.featured === true || false,
    // Ensure hours is a proper object
    hours: mappedBusiness.hours ? 
      (typeof mappedBusiness.hours === 'string' ? 
        JSON.parse(mappedBusiness.hours) : 
        mappedBusiness.hours
      ) : {}
  };

  return {
    success: true,
    business
  };
};

// Save a batch of businesses to Supabase
const saveBatchToSupabase = async (businesses: Business[]): Promise<{
  success: boolean;
  errorMessage?: string;
  successCount: number;
}> => {
  if (businesses.length === 0) {
    return { success: true, successCount: 0 };
  }

  try {
    let successCount = 0;
    
    // Process businesses individually to handle errors gracefully
    for (const business of businesses) {
      try {
        console.log("Saving business to Supabase:", business.name);
        
        // Clone the business and prepare it for saving
        const businessToSave = { ...business };
        
        // Remove the temporary ID before saving to let the database set it
        if ('id' in businessToSave && (businessToSave.id === 0 || businessToSave.id === null)) {
          delete businessToSave.id;
        }
        
        // Convert hours to string if it's an object
        if (businessToSave.hours && typeof businessToSave.hours === 'object') {
          businessToSave.hours = JSON.stringify(businessToSave.hours);
        }
        
        // Always remove timestamp fields - let the database handle these
        if ('created_at' in businessToSave) {
          delete businessToSave.created_at;
        }
        
        if ('updated_at' in businessToSave) {
          delete businessToSave.updated_at;
        }
        
        const { data, error } = await supabase
          .from('businesses')
          .insert(businessToSave)
          .select();
        
        if (error) {
          console.error("Error inserting business to Supabase:", error);
          throw error;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error("Error saving individual business:", business.name, err);
      }
    }
    
    return { 
      success: successCount > 0, 
      successCount,
      errorMessage: successCount === 0 ? "Failed to save any businesses" : undefined
    };
  } catch (error) {
    console.error("Error saving batch to Supabase:", error);
    return { 
      success: false, 
      errorMessage: `Error saving to database: ${error instanceof Error ? error.message : String(error)}`,
      successCount: 0
    };
  }
};

// Generate a CSV template for download
export const generateCSVTemplate = (): string => {
  // Headers in the format that Supabase will recognize
  const headers = ["name", "category", "address", "phone", "rating", "reviews", "description", "email", "website", "tags", "featured", "image"];
  
  // Create a user-friendly header row using the inverse mapping
  const inverseMapping = getInverseHeaderMapping();
  const userFriendlyHeaders = headers.map(dbField => inverseMapping[dbField] || dbField);
  
  // Sample data
  const rows = [
    [
      "Acme Coffee Shop", 
      "Cafe", 
      "123 Main St", 
      "555-123-4567", 
      "4.5", 
      "120", 
      "Best coffee in town", 
      "info@acmecoffee.com", 
      "https://acmecoffee.com", 
      "coffee, pastries", 
      "true", 
      "https://example.com/coffee.jpg"
    ],
    [
      "Tech Solutions", 
      "Technology", 
      "456 Tech Blvd", 
      "555-987-6543", 
      "5", 
      "87", 
      "Professional IT services", 
      "contact@techsolutions.com", 
      "https://techsolutions.com", 
      "it, services, computer repair", 
      "false", 
      ""
    ]
  ];
  
  // Combine headers and data
  const csvContent = [
    userFriendlyHeaders.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  return csvContent;
};
