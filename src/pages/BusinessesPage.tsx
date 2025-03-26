
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Metadata } from '@/components/shared/Metadata';
import useBusinessPageData from '@/hooks/useBusinessPageData';
import BusinessesHero from '@/components/businesses/BusinessesPage/BusinessesHero';
import BusinessesFilters from '@/components/businesses/BusinessesPage/BusinessesFilters';
import BusinessesGrid from '@/components/businesses/BusinessesPage/BusinessesGrid';
import BusinessesPagination from '@/components/businesses/BusinessesPage/BusinessesPagination';

const BusinessesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const {
    businesses,
    categories,
    tags,
    loading,
    filterByCategory,
    filterByTags,
    getFilteredBusinesses,
    visibleCategory,
    selectedTags,
    sortBusinesses,
    sortBy,
    sortDirection
  } = useBusinessPageData();
  
  // Get filtered and paginated businesses
  const filteredBusinesses = getFilteredBusinesses();
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSort = (field: string) => {
    const newDirection = sortBy === field && sortDirection === 'desc' ? 'asc' : 'desc';
    sortBusinesses(field, newDirection);
  };

  const clearAllFilters = () => {
    filterByCategory(null);
    filterByTags([]);
  };
  
  return (
    <>
      <Metadata
        title="Explore Local Businesses | Grow Bharat Vyapaar"
        description="Discover the best local businesses in your area. Browse by category, read reviews, and find top-rated services."
      />
      
      <BusinessesHero />
      
      <section className="container mx-auto px-4 py-12">
        <BusinessesFilters
          categories={categories}
          tags={tags}
          selectedCategory={visibleCategory}
          selectedTags={selectedTags}
          onCategorySelect={filterByCategory}
          onTagsSelect={filterByTags}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : paginatedBusinesses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BusinessesGrid 
              businesses={paginatedBusinesses} 
              clearAllFilters={clearAllFilters}
            />
            
            {totalPages > 1 && (
              <BusinessesPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-4">No businesses found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any businesses matching your filters. Try adjusting your search criteria or browse all businesses.
            </p>
          </div>
        )}
      </section>
    </>
  );
};

export default BusinessesPage;
