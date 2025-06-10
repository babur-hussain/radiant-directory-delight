
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
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
      'Hotels': 'Find comfortable stays for your next trip',
      'Restaurants': 'Discover the best dining experiences in your area',
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
      'Technology': 'Latest tech solutions and services',
      'Home Services': 'Professional home improvement services',
      'Legal': 'Expert legal advice and representation',
      'Financial': 'Trusted financial services and advice',
      'Pet Services': 'Care for your beloved pets',
      'Travel': 'Plan your perfect getaway',
      'Events': 'Make your celebrations memorable',
      'Consulting': 'Professional business consulting services'
    };
    
    return taglines[category] || `Discover the best ${category.toLowerCase()} businesses`;
  };
  
  // Comprehensive category matching function
  const isMatchingCategory = (businessCategory: string, searchCategory: string): boolean => {
    if (!businessCategory || !searchCategory) return false;
    
    const business = businessCategory.toLowerCase().trim();
    const search = searchCategory.toLowerCase().trim();
    
    // Exact match
    if (business === search) return true;
    
    // Remove common suffixes/prefixes for better matching
    const cleanBusiness = business
      .replace(/\b(store|shop|service|services|center|centre|dealer|supplier|wholesaler)\b/g, '')
      .trim();
    const cleanSearch = search
      .replace(/\b(store|shop|service|services|center|centre|dealer|supplier|wholesaler)\b/g, '')
      .trim();
    
    if (cleanBusiness === cleanSearch) return true;
    
    // Contains match
    if (business.includes(search) || search.includes(business)) return true;
    if (cleanBusiness.includes(cleanSearch) || cleanSearch.includes(cleanBusiness)) return true;
    
    // Word-based matching
    const businessWords = business.split(/\s+|[-_']/);
    const searchWords = search.split(/\s+|[-_']/);
    
    // Check if any significant words match
    const significantBusinessWords = businessWords.filter(word => word.length > 2);
    const significantSearchWords = searchWords.filter(word => word.length > 2);
    
    for (const bWord of significantBusinessWords) {
      for (const sWord of significantSearchWords) {
        if (bWord === sWord || bWord.includes(sWord) || sWord.includes(bWord)) {
          return true;
        }
      }
    }
    
    // Category-specific matching rules
    const categoryMappings: Record<string, string[]> = {
      'restaurant': ['food', 'dining', 'indian restaurant', 'asian', 'north indian', 'punjabi', 'dhaba', 'vegetarian', 'italian', 'cafe', 'coffee shop'],
      'food': ['restaurant', 'fast food', 'indian restaurant', 'asian', 'vegetarian', 'biryani', 'breakfast', 'dhaba', 'chicken', 'pizza', 'ice cream', 'cafe', 'coffee shop'],
      'clothing': ['clothing store', 'men\'s clothing', 'women\'s clothing', 'children\'s clothing', 'baby clothing', 'youth clothing', 'plus size clothing', 'designer clothing', 'saree shop', 'bridal shop'],
      'education': ['school', 'coaching center', 'library', 'education center', 'cbse school', 'computer training', 'government school', 'middle school', 'elementary school', 'preschool', 'kindergarten'],
      'medical': ['hospital', 'medical clinic', 'medical center', 'pharmacy', 'medical supply', 'eye care', 'dialysis center', 'pediatrician', 'gynecologist'],
      'automotive': ['car dealer', 'auto repair', 'vehicle dealer', 'truck dealer', 'used car dealer', 'renault dealer', 'suzuki dealer', 'ford dealer', 'motorcycle shop', 'auto parts'],
      'beauty': ['beauty parlour', 'hair salon', 'hairdresser', 'nail salon', 'make-up artist', 'mehndi designer', 'beautician', 'barber shop', 'massage spa'],
      'electronics': ['electronics store', 'computer store', 'mobile phone repair', 'computer repair', 'cell phone store', 'electronics accessories'],
      'grocery': ['grocery store', 'indian grocery', 'asian grocery', 'general store', 'fruit vegetable', 'produce market', 'dairy store'],
      'furniture': ['furniture store', 'furniture maker', 'home goods', 'mattress store'],
      'jewelry': ['jeweler', 'jewelry designer'],
      'fitness': ['fitness center', 'gym', 'sports complex', 'sports nutrition'],
      'wholesale': ['wholesaler', 'clothing wholesaler', 'stationery wholesaler', 'electronics wholesaler', 'agricultural wholesaler']
    };
    
    // Check category mappings
    for (const [key, values] of Object.entries(categoryMappings)) {
      if (search.includes(key) || cleanSearch.includes(key)) {
        if (values.some(v => business.includes(v) || cleanBusiness.includes(v))) {
          return true;
        }
      }
      if (business.includes(key) || cleanBusiness.includes(key)) {
        if (values.some(v => search.includes(v) || cleanSearch.includes(v))) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  const resetFilters = () => {
    // This function is required by BusinessGrid but doesn't need implementation here
  };
  
  useEffect(() => {
    const loadBusinesses = async () => {
      if (!categoryName) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching businesses for category:', formattedCategoryName);
        
        // Get all businesses first
        const { data: allBusinesses, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .order('name', { ascending: true });
        
        if (fetchError) {
          console.error('Error fetching businesses:', fetchError);
          throw fetchError;
        }
        
        console.log('Total businesses fetched:', allBusinesses?.length || 0);
        
        if (!allBusinesses || allBusinesses.length === 0) {
          setBusinesses([]);
          setLoading(false);
          return;
        }
        
        // Filter businesses based on category matching
        const searchTerms = [
          formattedCategoryName,
          categoryName?.replace(/-/g, ' '),
          categoryName?.replace(/-/g, '')
        ].filter(Boolean);
        
        console.log('Search terms:', searchTerms);
        
        const matchingBusinesses = allBusinesses.filter(business => {
          if (!business.category) return false;
          
          return searchTerms.some(term => 
            isMatchingCategory(business.category, term)
          );
        });
        
        console.log('Matching businesses found:', matchingBusinesses.length);
        console.log('Sample matches:', matchingBusinesses.slice(0, 3).map(b => ({
          name: b.name,
          category: b.category
        })));
        
        // Convert the data to match our Business type
        const processedData = matchingBusinesses.map(business => ({
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
            : (business.hours || {})
        })) as Business[];
        
        setBusinesses(processedData);
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
            
            {!loading && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Found {businesses.length} business{businesses.length !== 1 ? 'es' : ''} in {formattedCategoryName}
                </p>
              </div>
            )}
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
                    No businesses found for "{formattedCategoryName}"
                  </h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any businesses matching this category. Try exploring other categories or check back later.
                  </p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Go Back
                  </button>
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
