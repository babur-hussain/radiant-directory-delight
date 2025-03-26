import { useState, useEffect, useMemo } from "react";
import { 
  getAllBusinesses,
  addDataChangeListener,
  removeDataChangeListener,
  initializeData,
  Business
} from "@/lib/csv-utils";
import { businessesData } from "@/data/businessesData";

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
  const [businesses, setBusinesses] = useState<ExtendedBusiness[]>(businessesData as ExtendedBusiness[]);
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
        await initializeData();
        const fetchedBusinesses = getAllBusinesses();
        const extendedBusinesses = fetchedBusinesses.map(business => {
          const addressParts = business.address?.split(',') || [];
          const extractedLocation = addressParts.length > 1 
            ? addressParts[addressParts.length - 1].trim()
            : 'Unknown';
          return { ...business, location: extractedLocation };
        });
        setBusinesses(extendedBusinesses);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    const handleDataChanged = () => {
      const fetchedBusinesses = getAllBusinesses();
      const extendedBusinesses = fetchedBusinesses.map(business => {
        const addressParts = business.address?.split(',') || [];
        const extractedLocation = addressParts.length > 1 
          ? addressParts[addressParts.length - 1].trim()
          : 'Unknown';
        return { ...business, location: extractedLocation };
      });
      setBusinesses(extendedBusinesses);
    };
    
    addDataChangeListener(handleDataChanged);
    
    const handleCategoriesChanged = () => {
      setCustomCategories(getCustomCategories());
    };
    
    const handleLocationsChanged = () => {
      setCustomLocations(getCustomLocations());
    };
    
    window.addEventListener("categoriesChanged", handleCategoriesChanged);
    window.addEventListener("locationsChanged", handleLocationsChanged);
    
    return () => {
      removeDataChangeListener(handleDataChanged);
      window.removeEventListener("categoriesChanged", handleCategoriesChanged);
      window.removeEventListener("locationsChanged", handleLocationsChanged);
    };
  }, []);
  
  const categories = useMemo(() => {
    const businessCategories = Array.from(new Set(businesses.map(b => b.category)));
    const allCategories = [...new Set([...customCategories, ...businessCategories])].filter(Boolean);
    return allCategories;
  }, [businesses, customCategories]);
  
  const locations = useMemo(() => {
    const extractedLocations = businesses.map(b => {
      if (b.location) return b.location;
      
      const parts = b.address?.split(',') || [];
      return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0]?.trim() || 'Unknown';
    });
    
    const businessLocations = Array.from(new Set(extractedLocations));
    const allLocations = [...new Set([...customLocations, ...businessLocations])].filter(Boolean);
    return allLocations;
  }, [businesses, customLocations]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    businesses.forEach(business => {
      business.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [businesses]);
  
  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setCurrentPage(1);
  };
  
  const filteredBusinesses = useMemo(() => {
    let results = businesses.filter(business => {
      const matchesSearch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "" || business.category === selectedCategory;
      
      const matchesRating = selectedRating === "" || 
        (selectedRating === "4+" && business.rating >= 4) ||
        (selectedRating === "3+" && business.rating >= 3) ||
        (selectedRating === "2+" && business.rating >= 2);
        
      const matchesFeatured = !featuredOnly || business.featured;
      
      const matchesLocation = !selectedLocation || 
        (business.location && business.location.includes(selectedLocation)) || 
        business.address.includes(selectedLocation);
      
      const matchesTags = activeTags.length === 0 || 
        activeTags.some(tag => business.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesRating && 
             matchesFeatured && matchesLocation && matchesTags;
    });
    
    return results.sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      } else if (sortBy === "reviews") {
        return b.reviews - a.reviews;
      }
      return b.featured ? 1 : -1;
    });
  }, [
    businesses,
    searchQuery, 
    selectedCategory, 
    selectedRating, 
    featuredOnly, 
    selectedLocation, 
    activeTags, 
    sortBy
  ]);
  
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const currentBusinesses = filteredBusinesses.slice(
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
    filteredBusinesses,
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
