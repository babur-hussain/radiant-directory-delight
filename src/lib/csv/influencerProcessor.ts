
import Papa from 'papaparse';
import { Influencer, InfluencerCsvProcessingResult, InfluencerProcessingResult } from './influencerTypes';
import { notifyInfluencerDataChanged, getInfluencersData, setInfluencersData } from './influencerStore';
import { saveInfluencerBatchToSupabase } from './influencerDatabase';

// CSV header mapping for influencers
const influencerCsvHeaderMapping: Record<string, string> = {
  // Basic Info
  "Name": "name",
  "Influencer Name": "name",
  "Full Name": "name",
  "Email": "email",
  "Email Address": "email",
  "Phone": "phone",
  "Phone Number": "phone",
  "Mobile": "phone",
  "Mobile Number": "phone",
  "Bio": "bio",
  "Description": "bio",
  "About": "bio",
  
  // Social Media
  "Instagram": "instagram_handle",
  "Instagram Handle": "instagram_handle",
  "YouTube": "youtube_handle",
  "YouTube Handle": "youtube_handle",
  "TikTok": "tiktok_handle",
  "TikTok Handle": "tiktok_handle",
  "Facebook": "facebook_handle",
  "Facebook Handle": "facebook_handle",
  "Twitter": "twitter_handle",
  "Twitter Handle": "twitter_handle",
  "LinkedIn": "linkedin_handle",
  "LinkedIn Handle": "linkedin_handle",
  "Website": "website",
  "Website URL": "website",
  
  // Location
  "Location": "location",
  "City": "city",
  "State": "state",
  "Country": "country",
  
  // Metrics
  "Followers": "followers_count",
  "Followers Count": "followers_count",
  "Engagement Rate": "engagement_rate",
  "Rating": "rating",
  "Reviews": "reviews",
  
  // Content
  "Niche": "niche",
  "Category": "niche",
  "Tags": "tags",
  "Keywords": "tags",
  "Previous Brands": "previous_brands",
  "Collaborations": "previous_brands",
  
  // Status
  "Featured": "featured",
  "Priority": "priority",
  "Profile Image": "profile_image",
  "Cover Image": "cover_image"
};

// Helper function to process CSV data
export const processInfluencerCsvData = async (csvContent: string): Promise<InfluencerCsvProcessingResult> => {
  try {
    console.log("Processing influencer CSV content...");
    // Parse CSV data
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      console.error("CSV parsing errors:", results.errors);
      return {
        success: false,
        influencers: [],
        message: `CSV parsing failed: ${results.errors[0].message}`
      };
    }

    const parsedData = results.data as Record<string, any>[];
    if (parsedData.length === 0) {
      return {
        success: false,
        influencers: [],
        message: "No data found in CSV file."
      };
    }
    
    console.log("Parsed CSV headers:", results.meta.fields);
    console.log("First row of CSV data:", parsedData[0]);

    // Process the data to match our influencer structure
    const processedInfluencers: Influencer[] = [];
    const processingErrors: string[] = [];
    let successCount = 0;

    // Process in batches for better performance
    const BATCH_SIZE = 25;
    let currentBatch: Influencer[] = [];
    
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const processedInfluencer = await processSingleInfluencer(row, i);
      
      if (processedInfluencer.success && processedInfluencer.influencer) {
        currentBatch.push(processedInfluencer.influencer);
        processedInfluencers.push(processedInfluencer.influencer);
        
        // Process a batch when it reaches the batch size or it's the last item
        if (currentBatch.length >= BATCH_SIZE || i === parsedData.length - 1) {
          if (currentBatch.length > 0) {
            try {
              console.log(`Sending batch of ${currentBatch.length} influencers to Supabase...`);
              const { success, errorMessage, successCount: batchSuccessCount } = 
                await saveInfluencerBatchToSupabase(currentBatch);
              
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
      } else if (processedInfluencer.errorMessage) {
        processingErrors.push(processedInfluencer.errorMessage);
      }
    }

    // Save to our local data
    if (processedInfluencers.length > 0) {
      const influencersData = getInfluencersData();
      setInfluencersData([...influencersData, ...processedInfluencers]);
      notifyInfluencerDataChanged();
    }

    // Return results with appropriate message
    if (processingErrors.length > 0) {
      if (successCount === 0) {
        return {
          success: false,
          influencers: [],
          message: `Import failed: ${processingErrors.slice(0, 3).join(", ")}${processingErrors.length > 3 ? ` and ${processingErrors.length - 3} more errors` : ''}`
        };
      } else {
        return {
          success: true,
          influencers: processedInfluencers,
          message: `Imported ${successCount} influencers with ${processingErrors.length} errors`
        };
      }
    }

    // If no influencers were successfully processed, consider it a failure
    if (processedInfluencers.length === 0) {
      return {
        success: false,
        influencers: [],
        message: "No influencers could be processed. Check your CSV format and permissions."
      };
    }

    return {
      success: true,
      influencers: processedInfluencers,
      message: `Successfully imported ${successCount} influencers`
    };
  } catch (error) {
    console.error("Error processing influencer CSV data:", error);
    return {
      success: false,
      influencers: [],
      message: `Error processing CSV: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Process a single influencer row from CSV
export const processSingleInfluencer = async (
  row: Record<string, any>, 
  index: number
): Promise<InfluencerProcessingResult> => {
  // Map CSV headers to our influencer fields
  const mappedInfluencer: Record<string, any> = {};
  
  // Check for influencer name first since it's required
  let hasInfluencerName = false;
  
  // Try all possible influencer name headers
  for (const possibleHeader of ["Name", "Influencer Name", "Full Name", "name", "influencer_name", "fullname"]) {
    if (row[possibleHeader] && row[possibleHeader].trim() !== '') {
      mappedInfluencer.name = row[possibleHeader].trim();
      hasInfluencerName = true;
      break;
    }
  }
  
  // Skip if no influencer name found
  if (!hasInfluencerName) {
    return {
      success: false,
      errorMessage: `Row ${index + 1}: Missing required "Name" field`
    };
  }
  
  // Map the rest of the fields
  for (const csvHeader in row) {
    // Skip empty values
    if (row[csvHeader] === undefined || row[csvHeader] === null || row[csvHeader] === '') {
      continue;
    }
    
    // Skip if we already processed the name
    if (mappedInfluencer.name && (csvHeader === "Name" || csvHeader === "Influencer Name")) {
      continue;
    }
    
    const dbField = influencerCsvHeaderMapping[csvHeader];
    if (dbField) {
      mappedInfluencer[dbField] = row[csvHeader];
    }
  }
  
  // Handle tags field (convert from CSV string to array)
  if (mappedInfluencer.tags && typeof mappedInfluencer.tags === 'string') {
    mappedInfluencer.tags = mappedInfluencer.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag !== '');
  } else {
    mappedInfluencer.tags = [];
  }

  // Handle previous_brands field (convert from CSV string to array)
  if (mappedInfluencer.previous_brands && typeof mappedInfluencer.previous_brands === 'string') {
    mappedInfluencer.previous_brands = mappedInfluencer.previous_brands
      .split(',')
      .map((brand: string) => brand.trim())
      .filter((brand: string) => brand !== '');
  } else {
    mappedInfluencer.previous_brands = [];
  }

  // Convert numeric fields
  if (mappedInfluencer.followers_count) {
    const followers = parseInt(mappedInfluencer.followers_count, 10);
    mappedInfluencer.followers_count = isNaN(followers) ? 0 : followers;
  }

  if (mappedInfluencer.engagement_rate) {
    const engagement = parseFloat(mappedInfluencer.engagement_rate);
    mappedInfluencer.engagement_rate = isNaN(engagement) ? 0 : Math.min(100, Math.max(0, engagement));
  }

  if (mappedInfluencer.rating) {
    const rating = parseFloat(mappedInfluencer.rating);
    mappedInfluencer.rating = isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  }

  if (mappedInfluencer.reviews) {
    const reviews = parseInt(mappedInfluencer.reviews, 10);
    mappedInfluencer.reviews = isNaN(reviews) ? 0 : reviews;
  }

  if (mappedInfluencer.priority) {
    const priority = parseInt(mappedInfluencer.priority, 10);
    mappedInfluencer.priority = isNaN(priority) ? 0 : priority;
  }
  
  // Handle boolean fields
  if (mappedInfluencer.featured) {
    mappedInfluencer.featured = mappedInfluencer.featured === 'true' || mappedInfluencer.featured === true || false;
  }
  
  // Default profile image if not provided
  if (!mappedInfluencer.profile_image && mappedInfluencer.niche) {
    mappedInfluencer.profile_image = `https://source.unsplash.com/random/300x300/?${mappedInfluencer.niche.toLowerCase().replace(/\s+/g, ",")},influencer`;
  }

  // Create influencer object
  const influencer: Influencer = {
    ...mappedInfluencer,
    id: 0, // Temporary ID, will be replaced by database
    name: mappedInfluencer.name,
    niche: mappedInfluencer.niche || '',
    followers_count: mappedInfluencer.followers_count || 0,
    engagement_rate: mappedInfluencer.engagement_rate || 0,
    rating: mappedInfluencer.rating || 0,
    reviews: mappedInfluencer.reviews || 0,
    tags: mappedInfluencer.tags || [],
    previous_brands: mappedInfluencer.previous_brands || [],
    featured: mappedInfluencer.featured || false,
    priority: mappedInfluencer.priority || 0
  };

  return {
    success: true,
    influencer
  };
};
