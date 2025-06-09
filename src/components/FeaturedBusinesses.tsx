
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BusinessGrid from './businesses/BusinessGrid';
import Loading from './ui/loading';
import { toast } from '@/components/ui/use-toast';
import { Business } from '@/lib/csv/types';

const FeaturedBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load businesses data directly from Supabase
  useEffect(() => {
    const fetchFeaturedBusinesses = async () => {
      setLoading(true);
      try {
        console.log("Fetching featured businesses from Supabase...");
        // Fetch featured businesses from Supabase
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('featured', true)
          .order('name', { ascending: true })
          .limit(6);
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched featured businesses data:", data);
        
        // If no featured businesses found, try to get any businesses
        if (data.length === 0) {
          const { data: allData, error: allError } = await supabase
            .from('businesses')
            .select('*')
            .order('name', { ascending: true })
            .limit(6);
            
          if (allError) {
            throw allError;
          }
          
          console.log("Fetched all businesses as fallback:", allData);
          
          if (allData.length > 0) {
            // Format the businesses to match our Business type
            const formattedBusinesses = allData.map(business => ({
              ...business,
              // Ensure proper typing
              id: business.id,
              name: business.name,
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
              // Ensure hours is properly handled as an object
              hours: business.hours || {}
            })) as Business[];
            
            setBusinesses(formattedBusinesses);
            return;
          }
        }
        
        // Format the businesses to match our Business type
        const formattedBusinesses = data.map(business => ({
          ...business,
          // Ensure proper typing
          id: business.id,
          name: business.name,
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
          // Ensure hours is properly handled as an object
          hours: business.hours || {}
        })) as Business[];
        
        setBusinesses(formattedBusinesses);
      } catch (error) {
        console.error("Error loading businesses:", error);
        toast({
          title: "Error Loading Businesses",
          description: "There was an issue loading the featured businesses. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedBusinesses();
  }, []);
  
  // Reset filters function (required by BusinessGrid but not used here)
  const resetFilters = () => {
    // Not needed for featured businesses section
  };

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
            {/* Businesses Grid */}
            <BusinessGrid 
              businesses={businesses} 
              resetFilters={resetFilters} 
              loading={false} 
            />

            {/* Show a message when no featured businesses are found */}
            {businesses.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">
                  No businesses found. Try adding businesses through the admin dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
