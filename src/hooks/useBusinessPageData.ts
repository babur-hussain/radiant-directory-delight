
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Business } from "@/lib/csv/types";
import { useBusinessSearchFilter } from "./useBusinessSearchFilter";

// Extended business type that includes location field
export interface ExtendedBusiness extends Business {
  location: string;
}

type LocationFilter = string | null;
type SortOption = "relevance" | "rating" | "reviews";

// Helper functions defined before they're used
const getCustomCategories = (): string[] => {
  const storedCategories = localStorage.getItem("businessCategories");
  if (storedCategories) {
    const categories = JSON.parse(storedCategories);
    return categories.map((cat: { name: string }) => cat.name);
  }
  return [];
};

const getCustomLocations = (): string[] => {
  const storedLocations = localStorage.getItem("businessLocations");
  if (storedLocations) {
    const locations = JSON.parse(storedLocations);
    return locations.map((loc: { name: string }) => loc.name);
  }
  return [];
};

export const useBusinessPageData = (initialQuery: string = '') => {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<ExtendedBusiness[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<LocationFilter>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  const [customCategories, setCustomCategories] = useState<string[]>(getCustomCategories());
  const [customLocations, setCustomLocations] = useState<string[]>(getCustomLocations());
  
  const itemsPerPage = 40;
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('Fetching businesses from Supabase...');
        
        // Fetch all businesses from Supabase
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error fetching businesses:', error);
          throw error;
        }
        
        console.log('Fetched businesses from Supabase:', data);
        
        // Convert the data to match our Business type and add location
        const extendedBusinesses = data?.map(business => {
          const addressParts = business.address?.split(',') || [];
          const extractedLocation = addressParts.length > 1 
            ? addressParts[addressParts.length - 1].trim()
            : 'Unknown';
            
          return {
            id: business.id,
            name: business.name || '',
            category: business.category || '',
            address: business.address || '',
            phone: business.phone || '',
            description: business.description || '',
            email: business.email || '',
            website: business.website || '',
            rating: business.rating || 0,
            reviews: business.reviews || 0,
            image: business.image || '',
            featured: business.featured || false,
            tags: business.tags || [],
            hours: typeof business.hours === 'string' 
              ? JSON.parse(business.hours) 
              : (business.hours || {}),
            location: extractedLocation
          } as ExtendedBusiness;
        }) || [];
        
        setBusinesses(extendedBusinesses);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    const handleCategoriesChanged = () => {
      setCustomCategories(getCustomCategories());
    };
    
    const handleLocationsChanged = () => {
      setCustomLocations(getCustomLocations());
    };
    
    window.addEventListener("categoriesChanged", handleCategoriesChanged);
    window.addEventListener("locationsChanged", handleLocationsChanged);
    
    return () => {
      window.removeEventListener("categoriesChanged", handleCategoriesChanged);
      window.removeEventListener("locationsChanged", handleLocationsChanged);
    };
  }, []);
  
  const categories = useMemo(() => {
    const businessCategories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean)));
    const allCategories = [...new Set([...customCategories, ...businessCategories])].filter(Boolean);
    return allCategories.sort();
  }, [businesses, customCategories]);
  
  const locations = useMemo(() => {
    const extractedLocations = businesses.map(b => {
      if (b.location) return b.location;
      
      const parts = b.address?.split(',') || [];
      return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0]?.trim() || 'Unknown';
    });
    
    const businessLocations = Array.from(new Set(extractedLocations)).filter(Boolean);
    const allLocations = [...new Set([...customLocations, ...businessLocations])].filter(Boolean);
    return allLocations.sort();
  }, [businesses, customLocations]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    businesses.forEach(business => {
      if (Array.isArray(business.tags)) {
        business.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [businesses]);
  
  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setCurrentPage(1);
  };
  
  const { filteredBusinesses } = useBusinessSearchFilter(businesses, {
    searchQuery,
    selectedCategory,
    selectedRating,
    featuredOnly,
    selectedLocation,
    activeTags
  });
  
  const sortedBusinesses = useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      } else if (sortBy === "reviews") {
        return b.reviews - a.reviews;
      }
      // For relevance, prioritize featured businesses
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredBusinesses, sortBy]);
  
  const totalPages = Math.ceil(sortedBusinesses.length / itemsPerPage);
  const currentBusinesses = sortedBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRating, featuredOnly, selectedLocation, activeTags, sortBy]);
  
  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedRating("");
    setFeaturedOnly(false);
    setSearchQuery("");
    setSelectedLocation(null);
    setActiveTags([]);
    setSortBy("relevance");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedRating) count++;
    if (featuredOnly) count++;
    if (selectedLocation) count++;
    if (activeTags.length > 0) count++;
    return count;
  }, [selectedCategory, selectedRating, featuredOnly, selectedLocation, activeTags]);

  return {
    loading,
    businesses: currentBusinesses as unknown as Business[],
    filteredBusinesses: sortedBusinesses,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedRating,
    setSelectedRating,
    selectedLocation,
    setSelectedLocation,
    currentPage,
    setCurrentPage,
    featuredOnly,
    setFeaturedOnly,
    sortBy,
    setSortBy,
    activeTags,
    toggleTag,
    categories,
    locations,
    allTags,
    clearAllFilters,
    activeFilterCount,
    totalPages,
    itemsPerPage
  };
};
