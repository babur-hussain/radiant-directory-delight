
import { useState, useEffect, useMemo } from "react";
import { 
  getAllBusinesses,
  addDataChangeListener,
  removeDataChangeListener,
  initializeData
} from "@/lib/csv-utils";
import { businessesData } from "@/data/businessesData";
import TablePagination from "@/components/admin/table/TablePagination";
import BusinessesHeader from "@/components/businesses/BusinessesPage/BusinessesHeader";
import ActiveFiltersDisplay from "@/components/businesses/BusinessesPage/ActiveFiltersDisplay";
import BusinessesSorting from "@/components/businesses/BusinessesPage/BusinessesSorting";
import BusinessesGrid from "@/components/businesses/BusinessesPage/BusinessesGrid";

type LocationFilter = string | null;
type SortOption = "relevance" | "rating" | "reviews";

const BusinessesPage = () => {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState(businessesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<LocationFilter>(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  const itemsPerPage = 40;
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await initializeData();
        setBusinesses(getAllBusinesses());
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    const handleDataChanged = () => {
      setBusinesses(getAllBusinesses());
    };
    
    addDataChangeListener(handleDataChanged);
    
    return () => {
      removeDataChangeListener(handleDataChanged);
    };
  }, []);
  
  const categories = useMemo(() => {
    return Array.from(new Set(businesses.map(b => b.category)));
  }, [businesses]);
  
  const locations = useMemo(() => {
    return Array.from(new Set(businesses.map(b => {
      const parts = b.address.split(',');
      return parts.length > 1 ? parts[1].trim() : parts[0].trim();
    })));
  }, [businesses]);

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
      
      const matchesLocation = !selectedLocation || business.address.includes(selectedLocation);
      
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Local Businesses</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the best businesses in your area. Use the search and filters to narrow down your options.
          </p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading businesses...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Local Businesses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the best businesses in your area. Use the search and filters to narrow down your options.
        </p>
      </div>
      
      <BusinessesHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilterCount={activeFilterCount}
        setOpenFilters={setOpenFilters}
        openFilters={openFilters}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
        clearAllFilters={clearAllFilters}
        allTags={allTags}
        activeTags={activeTags}
        toggleTag={toggleTag}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        locations={locations}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
      />
      
      <BusinessesSorting 
        sortBy={sortBy}
        setSortBy={setSortBy}
        filteredCount={currentBusinesses.length}
        totalCount={filteredBusinesses.length}
      />
      
      <ActiveFiltersDisplay 
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        selectedRating={selectedRating}
        featuredOnly={featuredOnly}
        activeTags={activeTags}
        setSelectedCategory={setSelectedCategory}
        setSelectedLocation={setSelectedLocation}
        setSelectedRating={setSelectedRating}
        setFeaturedOnly={setFeaturedOnly}
        toggleTag={toggleTag}
        clearAllFilters={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
      
      <BusinessesGrid 
        businesses={currentBusinesses}
        clearAllFilters={clearAllFilters}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center my-8">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessesPage;
