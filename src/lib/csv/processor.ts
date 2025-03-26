
import Papa from 'papaparse';
import { Business, CsvProcessingResult, BusinessProcessingResult } from './types';
import { csvHeaderMapping } from '@/models/Business';
import { notifyDataChanged, getBusinessesData, setBusinessesData } from './store';
import { saveBatchToSupabase } from './database';

// Helper function to process CSV data
export const processCsvData = async (csvContent: string): Promise<CsvProcessingResult> => {
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
      
      if (processedBusiness.success && processedBusiness.business) {
        currentBatch.push(processedBusiness.business);
        processedBusinesses.push(processedBusiness.business);
        
        // Process a batch when it reaches the batch size or it's the last item
        if (currentBatch.length >= BATCH_SIZE || i === parsedData.length - 1) {
          if (currentBatch.length > 0) {
            try {
              const { success, errorMessage, successCount: batchSuccessCount } = 
                await saveBatchToSupabase(currentBatch);
              
              successCount += batchSuccessCount;
              
              if (!success && errorMessage) {
                processingErrors.push(errorMessage);
              }
            } catch (error) {
              processingErrors.push(`Batch processing error: ${error instanceof Error ? error.message : String(error)}`);
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
      const businessesData = getBusinessesData();
      setBusinessesData([...businessesData, ...processedBusinesses]);
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

    // If no businesses were successfully processed, consider it a failure
    if (processedBusinesses.length === 0) {
      return {
        success: false,
        businesses: [],
        message: "No businesses could be processed. Check your CSV format and permissions."
      };
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
export const processSingleBusiness = async (
  row: Record<string, any>, 
  index: number
): Promise<BusinessProcessingResult> => {
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
