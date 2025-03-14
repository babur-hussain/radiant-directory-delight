
import { useState, useEffect } from 'react';
import { getAllBusinesses } from '@/lib/csv-utils';
import CategoryFilter from './businesses/CategoryFilter';
import AdvancedFilters from './businesses/AdvancedFilters';
import ActiveFilters from './businesses/ActiveFilters';
import BusinessGrid from './businesses/BusinessGrid';
import Loading from './ui/loading';
import { toast } from '@/components/ui/use-toast';

const FeaturedBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load businesses data
  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      try {
        // Simulate network delay for loading state demonstration
        setTimeout(() => {
          // Get businesses from the utility function that combines original and uploaded businesses
          // getAllBusinesses now returns businesses sorted by priority
          const allBusinesses = getAllBusinesses();
          
          // Filter to featured businesses and take the first 6
          // Priority sorting is already applied by getAllBusinesses
          const featuredBusinesses = allBusinesses.filter(b => b.featured).slice(0, 6);
          setBusinesses(featuredBusinesses);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading businesses:", error);
        toast({
          title: "Error Loading Businesses",
          description: "There was an issue loading the featured businesses. Please try refreshing the page.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    loadBusinesses();
  }, []);
  
  const categories = Array.from(new Set(businesses.map(b => b.category)));
  
  // Extract unique locations (cities) from business addresses
  const locations = Array.from(new Set(businesses.map(b => {
    const parts = b.address.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  })));
  
  // Filter businesses based on all selected filters
  const filteredBusinesses = businesses.filter(business => {
    // Category filter
    if (visibleCategory && business.category !== visibleCategory) {
      return false;
    }
    
    // Rating filter
    if (selectedRating) {
      const minRating = parseInt(selectedRating.replace('+', ''));
      if (business.rating < minRating) {
        return false;
      }
    }
    
    // Location filter
    if (selectedLocation) {
      const businessLocation = business.address.split(',');
      const cityPart = businessLocation.length > 1 ? businessLocation[1].trim() : businessLocation[0].trim();
      if (cityPart !== selectedLocation) {
        return false;
      }
    }
    
    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setVisibleCategory(null);
    setSelectedRating(null);
    setSelectedLocation(null);
  };

  // Update URL with filters when they change
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (visibleCategory) {
      searchParams.set('category', visibleCategory);
    }
    
    if (selectedRating) {
      searchParams.set('rating', selectedRating);
    }
    
    if (selectedLocation) {
      searchParams.set('location', selectedLocation);
    }
    
    // Only update if there are filters
    if (searchParams.toString()) {
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${searchParams.toString()}`
      );
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [visibleCategory, selectedRating, selectedLocation]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Businesses</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Discover top-rated local businesses that consistently deliver exceptional service.
          </p>
        </div>
        
        {/* Show loading state or content */}
        {loading ? (
          <div className="py-16">
            <Loading size="xl" message="Loading featured businesses..." />
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <CategoryFilter 
              categories={categories} 
              visibleCategory={visibleCategory} 
              setVisibleCategory={setVisibleCategory} 
            />
            
            {/* Advanced Filters */}
            <div className="flex justify-center mb-6">
              <AdvancedFilters 
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                locations={locations}
                hasActiveFilters={!!(selectedRating || selectedLocation)}
              />
            </div>
            
            {/* Active Filters Display */}
            <ActiveFilters 
              selectedRating={selectedRating}
              selectedLocation={selectedLocation}
              setSelectedRating={setSelectedRating}
              setSelectedLocation={setSelectedLocation}
              resetFilters={resetFilters}
            />
            
            {/* Businesses Grid */}
            <BusinessGrid 
              businesses={filteredBusinesses} 
              resetFilters={resetFilters} 
              loading={false} 
            />
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
