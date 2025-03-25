
import { useState, useEffect, useMemo } from 'react';
import { Business } from '@/types/business';
import { supabase } from '@/integrations/supabase/client';
import { ensureTagsArray } from '@/types/business';

interface UseBusinessPageDataProps {
  initialBusinesses?: Business[];
  defaultCategory?: string;
  defaultSearch?: string;
  defaultFeaturedOnly?: boolean;
  defaultRatingFilter?: number;
}

interface BusinessPageData {
  businesses: Business[];
  filteredBusinesses: Business[];
  categories: string[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
  category: string;
  search: string;
  featuredOnly: boolean;
  ratingFilter: number;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  setFeaturedOnly: (featured: boolean) => void;
  setRatingFilter: (rating: number) => void;
  clearAllFilters: () => void;
  refreshData: () => Promise<void>;
}

const useBusinessPageData = ({
  initialBusinesses = [],
  defaultCategory = '',
  defaultSearch = '',
  defaultFeaturedOnly = false,
  defaultRatingFilter = 0
}: UseBusinessPageDataProps = {}): BusinessPageData => {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [category, setCategory] = useState(defaultCategory);
  const [search, setSearch] = useState(defaultSearch);
  const [featuredOnly, setFeaturedOnly] = useState(defaultFeaturedOnly);
  const [ratingFilter, setRatingFilter] = useState(defaultRatingFilter);
  
  // Fetch businesses from Supabase
  const fetchBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Convert data to Business type with proper tag handling
      const formattedData = data?.map(business => ({
        ...business,
        tags: ensureTagsArray(business.tags),
        rating: Number(business.rating) || 0,
        reviews: Number(business.reviews) || 0
      })) || [];
      
      setBusinesses(formattedData);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (initialBusinesses.length === 0) {
      fetchBusinesses();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  // Extract all unique categories
  const categories = useMemo(() => {
    const allCategories = businesses.map(business => business.category || 'Uncategorized');
    return ['All', ...Array.from(new Set(allCategories))];
  }, [businesses]);
  
  // Extract all unique tags
  const tags = useMemo(() => {
    const allTags: string[] = [];
    
    businesses.forEach(business => {
      const businessTags = ensureTagsArray(business.tags);
      businessTags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });
    
    return allTags.sort();
  }, [businesses]);
  
  // Apply filters
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      // Filter by category
      if (category && category !== 'All' && business.category !== category) {
        return false;
      }
      
      // Filter by rating
      if (ratingFilter > 0 && business.rating < ratingFilter) {
        return false;
      }
      
      // Filter by featured
      if (featuredOnly && !business.featured) {
        return false;
      }
      
      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = business.name.toLowerCase().includes(searchLower);
        const descriptionMatch = (business.description || '').toLowerCase().includes(searchLower);
        const categoryMatch = (business.category || '').toLowerCase().includes(searchLower);
        
        // Check if search term is in tags
        const tagsMatch = ensureTagsArray(business.tags).some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        if (!nameMatch && !descriptionMatch && !categoryMatch && !tagsMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [businesses, category, search, featuredOnly, ratingFilter]);
  
  // Clear all filters
  const clearAllFilters = () => {
    setCategory('');
    setSearch('');
    setFeaturedOnly(false);
    setRatingFilter(0);
  };
  
  // Refresh data
  const refreshData = async () => {
    await fetchBusinesses();
  };
  
  return {
    businesses,
    filteredBusinesses,
    categories,
    tags,
    isLoading,
    error,
    category,
    search,
    featuredOnly,
    ratingFilter,
    setCategory,
    setSearch,
    setFeaturedOnly,
    setRatingFilter,
    clearAllFilters,
    refreshData
  };
};

export default useBusinessPageData;
