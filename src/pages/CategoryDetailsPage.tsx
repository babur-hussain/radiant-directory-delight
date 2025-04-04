
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { fetchBusinessesByCategory } from '@/api/services/businessAPI';
import { Business } from '@/lib/csv/types';
import BusinessGrid from '@/components/businesses/BusinessGrid';
import Loading from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getCategoryIcon, getCategoryColor } from '@/lib/category-utils';

const CategoryDetailsPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get formatted category name with proper capitalization
  const formattedCategoryName = categoryName
    ? categoryName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';
  
  // Get tagline based on category
  const getTagline = (category: string) => {
    const taglines: Record<string, string> = {
      'Restaurants': 'Discover the best dining experiences in your area',
      'Hotels': 'Find comfortable stays for your next trip',
      'Shopping': 'Explore the finest shopping destinations',
      'Healthcare': 'Your health is our priority',
      'Education': 'Quality education for a brighter future',
      'Automotive': 'Top services for your vehicle needs',
      'Professional': 'Expert services for your business',
      'Real Estate': 'Find your dream property',
      'Beauty': 'Look and feel your best',
      'Repair': 'Quick and reliable repair services',
      'Entertainment': 'Find fun activities and events',
      'Fitness': 'Achieve your fitness goals',
    };
    
    return taglines[category] || `Discover the best ${category} businesses`;
  };
  
  const resetFilters = () => {
    // This function is required by BusinessGrid but doesn't need implementation here
  };
  
  useEffect(() => {
    const loadBusinesses = async () => {
      if (!categoryName) return;
      
      setLoading(true);
      try {
        // Convert category name from URL format (e.g., "real-estate") to proper format (e.g., "Real Estate")
        const properCategoryName = formattedCategoryName;
        
        // Fetch businesses for this category
        const data = await fetchBusinessesByCategory(properCategoryName);
        
        // Convert the hours property from JSON to Record<string, any> if needed
        const processedData = data?.map(business => ({
          ...business,
          hours: typeof business.hours === 'string' 
            ? JSON.parse(business.hours) 
            : (business.hours || {})
        })) as Business[];
        
        setBusinesses(processedData || []);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinesses();
  }, [categoryName, formattedCategoryName]);
  
  // Get icon and color for the category
  const IconComponent = getCategoryIcon(formattedCategoryName);
  const colorClass = getCategoryColor(formattedCategoryName);
  
  return (
    <Layout>
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {IconComponent && (
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
                colorClass
              )}>
                <IconComponent className="h-10 w-10" />
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {formattedCategoryName} Businesses
            </h1>
            
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {getTagline(formattedCategoryName)}
            </p>
          </motion.div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loading size="lg" message={`Loading ${formattedCategoryName} businesses...`} />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <BusinessGrid 
                businesses={businesses} 
                resetFilters={resetFilters} 
                loading={false} 
              />
              
              {businesses.length === 0 && !loading && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No businesses found in this category
                  </h3>
                  <p className="text-gray-500">
                    Please check back later or explore other categories
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryDetailsPage;
