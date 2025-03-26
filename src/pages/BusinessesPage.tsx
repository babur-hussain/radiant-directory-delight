
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TablePagination from "@/components/admin/table/TablePagination";
import BusinessesHeader from "@/components/businesses/BusinessesPage/BusinessesHeader";
import ActiveFiltersDisplay from "@/components/businesses/BusinessesPage/ActiveFiltersDisplay";
import BusinessesSorting from "@/components/businesses/BusinessesPage/BusinessesSorting";
import BusinessesGrid from "@/components/businesses/BusinessesPage/BusinessesGrid";
import { useBusinessPageData } from "@/hooks/useBusinessPageData";
import { BusinessPageLoading } from "@/components/businesses/BusinessPageLoading";
import { useBusinessSearchFilter } from "@/hooks/useBusinessSearchFilter";

const BusinessesPage = () => {
  const [openFilters, setOpenFilters] = useState(false);
  const location = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  // Get search param from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [location.search]);

  const {
    loading,
    businesses: currentBusinesses,
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
    locations,
    allTags,
    clearAllFilters,
    activeFilterCount,
    totalPages
  } = useBusinessPageData();
  
  // Handle search state
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);
  
  if (loading) {
    return <BusinessPageLoading />;
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
        isSearching={isSearching}
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
