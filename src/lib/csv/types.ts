
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

export interface CsvProcessingResult {
  success: boolean;
  businesses: Business[];
  message: string;
}

export interface BatchSaveResult {
  success: boolean;
  errorMessage?: string;
  successCount: number;
}

export interface BusinessProcessingResult {
  success: boolean;
  business?: Business;
  errorMessage?: string;
}
