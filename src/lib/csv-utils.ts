import { supabase } from '@/integrations/supabase/client';
import type { Business } from '@/types/business';
import { ensureTagsArray, parseHours } from '@/types/business';
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';

export { Business };  // Export Business for other modules to use

// CSV columns to headers mapping
const CSV_HEADERS = {
  name: 'Name',
  category: 'Category',
  description: 'Description',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  image: 'Image URL',
  hours: 'Opening Hours',
  rating: 'Rating',
  reviews: 'Reviews',
  featured: 'Featured',
  tags: 'Tags',
  latitude: 'Latitude',
  longitude: 'Longitude'
};

// Helper to convert CSV row to business object
export const csvRowToBusiness = (row: Record<string, string>): Business => {
  // Convert string 'true'/'false' to boolean
  const featured = row[CSV_HEADERS.featured]?.toLowerCase() === 'true';
  
  // Convert rating and reviews to numbers
  const rating = parseFloat(row[CSV_HEADERS.rating]) || 0;
  const reviews = parseInt(row[CSV_HEADERS.reviews]) || 0;
  
  // Handle tags - split by comma if it's a string
  const tags = row[CSV_HEADERS.tags] ? row[CSV_HEADERS.tags].split(',').map(tag => tag.trim()) : [];
  
  // Parse coordinates if provided
  const latitude = row[CSV_HEADERS.latitude] ? parseFloat(row[CSV_HEADERS.latitude]) : undefined;
  const longitude = row[CSV_HEADERS.longitude] ? parseFloat(row[CSV_HEADERS.longitude]) : undefined;
  
  // hours can be JSON string or object, we'll keep it as string for now
  return {
    id: 0, // Will be assigned by the database
    name: row[CSV_HEADERS.name] || '',
    category: row[CSV_HEADERS.category] || '',
    description: row[CSV_HEADERS.description] || '',
    address: row[CSV_HEADERS.address] || '',
    phone: row[CSV_HEADERS.phone] || '',
    email: row[CSV_HEADERS.email] || '',
    website: row[CSV_HEADERS.website] || '',
    image: row[CSV_HEADERS.image] || '',
    hours: row[CSV_HEADERS.hours] || null,
    rating,
    reviews,
    featured,
    tags,
    latitude,
    longitude,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Helper to prepare a business object for Supabase insert/update
const prepareBusinessForDb = (business: Business) => {
  const preparedBusiness: any = { ...business };
  
  // Ensure tags is always an array in the database
  if (typeof preparedBusiness.tags === 'string') {
    preparedBusiness.tags = ensureTagsArray(preparedBusiness.tags);
  }
  
  // Convert hours to a string if it's an object
  if (preparedBusiness.hours && typeof preparedBusiness.hours === 'object') {
    preparedBusiness.hours = JSON.stringify(preparedBusiness.hours);
  }
  
  return preparedBusiness;
};

// Parse CSV file and convert to Business objects
export const parseBusinessesCSV = (file: File): Promise<Business[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const businesses: Business[] = results.data
            .filter((row: any) => row[CSV_HEADERS.name]) // Skip rows without a name
            .map((row: any) => csvRowToBusiness(row));
          resolve(businesses);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Generate CSV template with headers
export const generateCSVTemplate = (): string => {
  const headers = Object.values(CSV_HEADERS);
  return Papa.unparse([headers.reduce((obj, header, i) => ({ ...obj, [header]: '' }), {})]);
};

// Upload businesses to Supabase
export const uploadBusinessesCSV = async (businesses: Business[]): Promise<Business[]> => {
  try {
    const insertedBusinesses: Business[] = [];
    
    // Process in small batches to avoid API limits
    const batchSize = 10;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      
      // Prepare each business for database insertion
      const preparedBatch = batch.map(business => prepareBusinessForDb(business));
      
      const { data, error } = await supabase
        .from('businesses')
        .insert(preparedBatch)
        .select();
        
      if (error) {
        console.error('Error inserting businesses batch:', error);
        throw error;
      }
      
      if (data) {
        insertedBusinesses.push(...data as Business[]);
      }
    }
    
    return insertedBusinesses;
  } catch (error) {
    console.error('Error uploading businesses CSV:', error);
    throw error;
  }
};

// Update existing businesses from CSV
export const updateBusinessesFromCSV = async (businesses: Business[]): Promise<Business[]> => {
  try {
    const updatedBusinesses: Business[] = [];
    
    // Process in small batches
    const batchSize = 10;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      
      for (const business of batch) {
        // Skip items without ID
        if (!business.id) {
          console.warn('Skipping update for business without ID:', business.name);
          continue;
        }
        
        const preparedBusiness = prepareBusinessForDb(business);
        
        const { data, error } = await supabase
          .from('businesses')
          .update(preparedBusiness)
          .eq('id', business.id)
          .select();
        
        if (error) {
          console.error(`Error updating business ${business.id}:`, error);
          continue; // Skip to next business
        }
        
        if (data && data.length > 0) {
          updatedBusinesses.push(data[0] as Business);
        }
      }
    }
    
    return updatedBusinesses;
  } catch (error) {
    console.error('Error updating businesses from CSV:', error);
    throw error;
  }
};

// Get all headers for CSV export
export const getBusinessesCSVHeaders = (): string[] => {
  return Object.values(CSV_HEADERS);
};

// Convert businesses to CSV format
export const convertBusinessesToCSV = (businesses: Business[]): string => {
  const rows = businesses.map(business => {
    const row: Record<string, any> = {};
    
    // Map each business field to its CSV header
    Object.entries(CSV_HEADERS).forEach(([field, header]) => {
      const key = field as keyof Business;
      let value = business[key];
      
      // Special handling for arrays (tags)
      if (field === 'tags' && Array.isArray(business.tags)) {
        value = (business.tags as string[]).join(', ');
      }
      
      // Special handling for objects (hours)
      if (field === 'hours' && typeof business.hours === 'object' && business.hours !== null) {
        value = JSON.stringify(business.hours);
      }
      
      row[header] = value;
    });
    
    return row;
  });
  
  return Papa.unparse(rows);
};

export const downloadCSV = (csvContent: string, filename = 'businesses.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
