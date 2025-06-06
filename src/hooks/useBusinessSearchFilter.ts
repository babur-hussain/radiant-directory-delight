
import { useState, useEffect, useMemo } from 'react';
import { Business } from '@/lib/csv/types';

export interface SearchFilterOptions {
  searchQuery: string;
  selectedCategory: string;
  selectedRating: string;
  featuredOnly: boolean;
  selectedLocation: string | null;
  activeTags: string[];
}

export const useBusinessSearchFilter = (
  businesses: Business[],
  options: SearchFilterOptions
) => {
  const { 
    searchQuery, 
    selectedCategory, 
    selectedRating, 
    featuredOnly, 
    selectedLocation, 
    activeTags 
  } = options;
  
  const [isSearching, setIsSearching] = useState(false);
  
  // Reset searching state when search query changes
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);
  
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      // Search by name, description, or tags
      const matchesSearch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (business.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        // Make sure the tags field is an array
        (Array.isArray(business.tags) && 
          business.tags.some(tag => 
            typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      
      // Filter by category
      const matchesCategory = selectedCategory === "" || business.category === selectedCategory;
      
      // Filter by rating
      const matchesRating = selectedRating === "" || 
        (selectedRating === "4+" && business.rating >= 4) ||
        (selectedRating === "3+" && business.rating >= 3) ||
        (selectedRating === "2+" && business.rating >= 2);
        
      // Filter by featured status
      const matchesFeatured = !featuredOnly || business.featured;
      
      // Filter by location
      const matchesLocation = !selectedLocation || 
        (business.address && business.address.includes(selectedLocation));
      
      // Filter by tags
      const matchesTags = activeTags.length === 0 || 
        (Array.isArray(business.tags) && 
          activeTags.some(tag => business.tags.includes(tag)));
      
      return matchesSearch && matchesCategory && matchesRating && 
             matchesFeatured && matchesLocation && matchesTags;
    });
  }, [
    businesses,
    searchQuery,
    selectedCategory,
    selectedRating,
    featuredOnly,
    selectedLocation,
    activeTags
  ]);
  
  return {
    filteredBusinesses,
    isSearching
  };
};
