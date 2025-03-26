import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/types/supabase';

export interface Business {
  id: number;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours?: Record<string, string> | string | null;
  rating: number;
  reviews: number;
  featured?: boolean;
  tags: string[] | string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export const ensureTagsArray = (tags: string | string[] | null | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map(tag => tag.trim());
};

export const parseHours = (hours: Json | null): Record<string, string> | null => {
  if (!hours) return null;
  
  try {
    if (typeof hours === 'string') {
      return JSON.parse(hours) as Record<string, string>;
    } else if (typeof hours === 'object') {
      return hours as Record<string, string>;
    }
  } catch (e) {
    console.error('Error parsing hours:', e);
  }
  
  return null;
};

export const formatBusiness = (data: any): Business => {
  return {
    id: data.id,
    name: data.name || '',
    category: data.category || '',
    description: data.description || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    image: data.image || '',
    hours: data.hours,
    rating: Number(data.rating) || 0,
    reviews: Number(data.reviews) || 0,
    featured: Boolean(data.featured),
    tags: data.tags || [],
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

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

export const csvRowToBusiness = (row: Record<string, string>): Business => {
  const featured = row[CSV_HEADERS.featured]?.toLowerCase() === 'true';
  
  const rating = parseFloat(row[CSV_HEADERS.rating]) || 0;
  const reviews = parseInt(row[CSV_HEADERS.reviews]) || 0;
  
  const tags = row[CSV_HEADERS.tags] ? row[CSV_HEADERS.tags].split(',').map(tag => tag.trim()) : [];
  
  const latitude = row[CSV_HEADERS.latitude] ? parseFloat(row[CSV_HEADERS.latitude]) : undefined;
  const longitude = row[CSV_HEADERS.longitude] ? parseFloat(row[CSV_HEADERS.longitude]) : undefined;
  
  return {
    id: 0,
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

const prepareBusinessForDb = (business: Business) => {
  const preparedBusiness: any = { ...business };
  
  if (typeof preparedBusiness.tags === 'string') {
    preparedBusiness.tags = ensureTagsArray(preparedBusiness.tags);
  }
  
  if (preparedBusiness.hours && typeof preparedBusiness.hours === 'object') {
    preparedBusiness.hours = JSON.stringify(preparedBusiness.hours);
  }
  
  return preparedBusiness;
};

export const parseBusinessesCSV = (file: File): Promise<Business[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const businesses: Business[] = results.data
            .filter((row: any) => row[CSV_HEADERS.name])
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

export const generateCSVTemplate = (): string => {
  const headers = Object.values(CSV_HEADERS);
  return Papa.unparse([headers.reduce((obj, header, i) => ({ ...obj, [header]: '' }), {})]);
};

export const uploadBusinessesCSV = async (businesses: Business[]): Promise<Business[]> => {
  try {
    const insertedBusinesses: Business[] = [];
    
    const batchSize = 10;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      
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

export const processCsvData = async (csvContent: string): Promise<{
  success: boolean;
  businesses: Business[];
  message: string;
}> => {
  try {
    const businesses: Business[] = [];
    
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    if (results.errors.length > 0) {
      return {
        success: false,
        businesses: [],
        message: `CSV parsing error: ${results.errors[0].message}`
      };
    }
    
    results.data.forEach((row: any) => {
      if (row.name) {
        businesses.push(csvRowToBusiness(row));
      }
    });
    
    if (businesses.length === 0) {
      return {
        success: false,
        businesses: [],
        message: 'No valid business entries found in the CSV file'
      };
    }
    
    const insertedBusinesses = await uploadBusinessesCSV(businesses);
    
    return {
      success: true,
      businesses: insertedBusinesses,
      message: `Successfully processed ${insertedBusinesses.length} businesses`
    };
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return {
      success: false,
      businesses: [],
      message: `Error processing CSV data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }

    // Ensure the data conforms to our Business type
    const businesses: Business[] = data.map(item => {
      let hours: string | Record<string, string> | null = null;
      try {
        if (typeof item.hours === 'string') {
          hours = JSON.parse(item.hours);
        } else if (item.hours && typeof item.hours === 'object') {
          hours = item.hours;
        }
      } catch (e) {
        console.warn('Could not parse hours:', e);
      }

      let tags: string[] = [];
      if (Array.isArray(item.tags)) {
        tags = item.tags;
      } else if (typeof item.tags === 'string') {
        tags = item.tags.split(',').map(tag => tag.trim());
      }

      return {
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        address: item.address || '',
        phone: item.phone || '',
        email: item.email || '',
        website: item.website || '',
        image: item.image || '',
        hours,
        rating: Number(item.rating) || 0,
        reviews: Number(item.reviews) || 0,
        featured: Boolean(item.featured),
        tags,
        latitude: Number(item.latitude) || 0,
        longitude: Number(item.longitude) || 0,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      };
    });

    return businesses;
  } catch (error) {
    console.error("Error getting businesses:", error);
    return [];
  }
};

export const initializeData = (): void => {
  console.log("Initializing business data...");
};

export const updateBusinessesFromCSV = async (businesses: Business[]): Promise<Business[]> => {
  try {
    const updatedBusinesses: Business[] = [];
    
    const batchSize = 10;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      
      for (const business of batch) {
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
          continue;
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

export const getBusinessesCSVHeaders = (): string[] => {
  return Object.values(CSV_HEADERS);
};

export const convertBusinessesToCSV = (businesses: Business[]): string => {
  const rows = businesses.map(business => {
    const row: Record<string, any> = {};
    
    Object.entries(CSV_HEADERS).forEach(([field, header]) => {
      const key = field as keyof Business;
      let value = business[key];
      
      if (field === 'tags' && Array.isArray(business.tags)) {
        value = (business.tags as string[]).join(', ');
      }
      
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

