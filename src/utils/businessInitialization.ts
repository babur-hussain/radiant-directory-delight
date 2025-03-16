
import { Business, IBusiness } from '../models/Business';
import { getAllBusinesses } from '@/lib/csv-utils';
import { saveBusiness } from '@/lib/mongodb-utils';

export const initializeBusinessesInMongoDB = async (
  progressCallback?: (progress: number) => void
): Promise<{ loaded: number; failed: number }> => {
  try {
    console.log('Starting business initialization in MongoDB');
    
    // Check if businesses already exist in MongoDB
    const existingCount = await Business.countDocuments();
    console.log(`Found ${existingCount} existing businesses in MongoDB`);
    
    if (existingCount > 0) {
      console.log('Businesses already exist in MongoDB, skipping initialization');
      return { loaded: existingCount, failed: 0 };
    }
    
    // Get all businesses from CSV data or Firestore
    const businesses = getAllBusinesses();
    console.log(`Retrieved ${businesses.length} businesses to load into MongoDB`);
    
    if (!businesses || businesses.length === 0) {
      console.warn('No businesses found to load into MongoDB');
      return { loaded: 0, failed: 0 };
    }
    
    let loaded = 0;
    let failed = 0;
    
    // Import businesses to MongoDB
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      
      try {
        // Convert to MongoDB model format
        const businessData: IBusiness = {
          id: business.id,
          name: business.name,
          description: business.description || '',
          category: business.category || '',
          address: business.address || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          rating: Number(business.rating) || 0,
          reviews: Number(business.reviews) || 0,
          latitude: Number(business.latitude) || 0,
          longitude: Number(business.longitude) || 0,
          hours: business.hours || {},
          tags: business.tags || [],
          featured: Boolean(business.featured) || false,
          image: business.image || ''
        };
        
        // Save to MongoDB
        await Business.create(businessData);
        loaded++;
      } catch (error) {
        console.error(`Failed to load business "${business.name}" to MongoDB:`, error);
        failed++;
      }
      
      // Update progress
      if (progressCallback) {
        progressCallback((i + 1) / businesses.length);
      }
    }
    
    console.log(`Successfully loaded ${loaded} businesses to MongoDB, ${failed} failed`);
    return { loaded, failed };
  } catch (error) {
    console.error('Error initializing businesses in MongoDB:', error);
    throw error;
  }
};
