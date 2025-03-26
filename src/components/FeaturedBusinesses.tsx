import { useState, useEffect } from 'react';
import { Business, ensureTagsArray, convertToCsvBusiness, convertToBusinessType } from '@/types/business';
import CategoryFilter from './businesses/CategoryFilter';
import AdvancedFilters from './businesses/AdvancedFilters';
import ActiveFilters from './businesses/ActiveFilters';
import BusinessGrid from './businesses/BusinessGrid';
import Loading from './ui/loading';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseToBusiness } from '@/types/business';

const FeaturedBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('featured', true)
          .order('rating', { ascending: false })
          .limit(6);
          
        if (error) {
          throw error;
        }
        
        const featuredBusinesses: Business[] = data.map(item => mapSupabaseToBusiness(item));
        
        setBusinesses(featuredBusinesses);
        setLoading(false);
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
  
  const categories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean)));
  
  // Extract locations from addresses - Fixed to handle undefined address
  const locations = Array.from(new Set(businesses.map(b => {
    if (typeof b.address === 'string' && b.address) {
      const parts = b.address.split(',');
      return parts.length > 1 ? parts[1].trim() : parts[0]?.trim() || '';
    }
    return '';
  }).filter(Boolean)));
  
  const filteredBusinesses = businesses.filter(business => {
    if (visibleCategory && business.category !== visibleCategory) {
      return false;
    }
    
    if (selectedRating) {
      const minRating = parseInt(selectedRating.replace('+', ''));
      if ((business.rating || 0) < minRating) {
        return false;
      }
    }
    
    if (selectedLocation && typeof business.address === 'string') {
      const businessLocation = business.address.split(',');
      const cityPart = businessLocation.length > 1 ? businessLocation[1].trim() : businessLocation[0]?.trim() || '';
      if (cityPart !== selectedLocation) {
        return false;
      }
    }
    
    return true;
  });

  const resetFilters = () => {
    setVisibleCategory(null);
    setSelectedRating(null);
    setSelectedLocation(null);
  };

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

  // Convert businesses to csv-utils format for BusinessGrid
  const csvBusinesses = filteredBusinesses.map(business => {
    // Ensure all required fields are present, particularly description
    return {
      ...business,
      description: business.description || '',  // Make sure description is never undefined
      category: business.category || ''         // Make sure category is never undefined
    };
  });

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Businesses</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Discover top-rated local businesses that consistently deliver exceptional service.
          </p>
        </div>
        
        {loading ? (
          <div className="py-16">
            <Loading size="xl" message="Loading featured businesses..." />
          </div>
        ) : (
          <>
            <CategoryFilter 
              categories={categories} 
              visibleCategory={visibleCategory} 
              setVisibleCategory={setVisibleCategory} 
            />
            
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
            
            <ActiveFilters 
              selectedRating={selectedRating}
              selectedLocation={selectedLocation}
              setSelectedRating={setSelectedRating}
              setSelectedLocation={setSelectedLocation}
              resetFilters={resetFilters}
            />
            
            <BusinessGrid 
              businesses={csvBusinesses}
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
