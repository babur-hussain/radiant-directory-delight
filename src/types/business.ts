
export interface Business {
  id: number | string;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours?: string | Record<string, string>;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}
