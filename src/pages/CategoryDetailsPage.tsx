
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
  
  // Enhanced category matching function with real-time categorization
  const categorizeBusiness = (businessCategory: string, searchCategory: string): boolean => {
    if (!businessCategory || !searchCategory) return false;
    
    const business = businessCategory.toLowerCase().trim();
    const search = searchCategory.toLowerCase().trim();
    
    console.log(`Categorizing: "${businessCategory}" for search: "${searchCategory}"`);
    
    // Direct exact match
    if (business === search) {
      console.log('✓ Exact match');
      return true;
    }
    
    // Category mapping for better matching
    const categoryMaps: Record<string, string[]> = {
      'restaurants': [
        'restaurant', 'indian restaurant', 'asian', 'north indian', 'punjabi', 'dhaba', 
        'vegetarian', 'italian', 'fast food', 'pizza', 'biryani', 'breakfast', 'chicken', 
        'wok restaurant', 'pizza takeout', 'snack bar', 'tiffin service provider'
      ],
      'food': [
        'restaurant', 'fast food', 'indian restaurant', 'asian', 'vegetarian', 'biryani', 
        'breakfast', 'dhaba', 'chicken', 'pizza', 'ice cream', 'cafe', 'coffee shop', 
        'bakery and cake shop', 'cake shop', 'sweet shop', 'chocolate shop', 'dry fruit store', 
        'tiffin service provider', 'salad'
      ],
      'hotels': ['hotel', 'lodging', 'boys\' hostel'],
      'shopping': [
        'shopping mall', 'store', 'gift shop', 'book store', 'shoe store', 'stationery store', 
        'hardware store', 'tile store', 'perfume store', 'tobacco shop', 'clothing store', 
        'electronics store', 'grocery store', 'hypermarket', 'general store', 'supermarket'
      ],
      'clothing': [
        'clothing store', 'men\'s clothing store', 'women\'s clothing store', 'children\'s clothing store', 
        'baby clothing store', 'youth clothing store', 'plus size clothing store', 'designer clothing store', 
        'saree shop', 'bridal shop', 'clothing wholesaler', 'clothing manufacturer', 'tuxedo shop'
      ],
      'education': [
        'school', 'coaching center', 'library', 'education center', 'cbse school', 'computer training school', 
        'government school', 'middle school', 'elementary school', 'preschool', 'kindergarten school', 
        'private educational institution', 'tutoring service', 'software training institute', 
        'civil examinations academy', 'dance school'
      ],
      'healthcare': [
        'hospital', 'medical clinic', 'medical center', 'pharmacy', 'medical supply store', 'eye care', 
        'dialysis center', 'pediatrician', 'gynecologist', 'children\'s hospital', 'private hospital', 
        'obstetrician-gynecologist'
      ],
      'automotive': [
        'car dealer', 'auto repair', 'vehicle dealer', 'truck dealer', 'used car dealer', 'renault dealer', 
        'suzuki dealer', 'ford dealer', 'motorcycle shop', 'auto parts store', 'car stereo store', 
        'car repair and maintenance service', 'car wash', 'auto accessories', 'truck repair shop', 
        'auto dent removal service station', 'motor vehicle dealer', 'electric motor scooter dealer'
      ],
      'beauty': [
        'beauty parlour', 'hair salon', 'hairdresser', 'nail salon', 'make-up artist', 'mehndi designer', 
        'beautician', 'barber shop', 'massage spa'
      ],
      'electronics': [
        'electronics store', 'computer store', 'mobile phone repair shop', 'cell phone store', 
        'electronics accessories wholesaler', 'electrical supply store', 'electronics wholesaler', 
        'electrical products wholesaler', 'internet cafe'
      ],
      'fitness': [
        'fitness center', 'gym', 'sports complex', 'sports nutrition store', 'sporting goods store', 
        'sports accessories wholesaler'
      ],
      'furniture': ['furniture store', 'furniture maker', 'mattress store', 'home goods store'],
      'jewelry': ['jeweler', 'jewelry designer'],
      'wholesale': [
        'wholesaler', 'clothing wholesaler', 'stationery wholesaler', 'electronics wholesaler', 
        'agricultural product wholesaler', 'oil wholesaler', 'battery wholesaler', 'footwear wholesaler', 
        'wholesale bakery', 'wholesale market', 'vegetable wholesale market', 'clothing wholesale market place'
      ],
      'services': [
        'wedding services', 'printing services', 'chauffeur service', 'computer repair service', 
        'weight loss service', 'interior decorator', 'photography service', 'event venue', 
        'banquet hall', 'corporate office', 'software company', 'packaging company', 'wedding service'
      ]
    };
    
    // Check if the search term matches any category group
    for (const [categoryGroup, keywords] of Object.entries(categoryMaps)) {
      if (search.includes(categoryGroup) || categoryGroup.includes(search)) {
        if (keywords.some(keyword => business.includes(keyword.toLowerCase()))) {
          console.log(`✓ Category group match: ${categoryGroup}`);
          return true;
        }
      }
    }
    
    // Word-based matching for partial matches
    const businessWords = business.split(/[\s\-_'&(),]+/).filter(word => word.length > 2);
    const searchWords = search.split(/[\s\-_'&(),]+/).filter(word => word.length > 2);
    
    // Check if any significant words match
    for (const bWord of businessWords) {
      for (const sWord of searchWords) {
        if (bWord.includes(sWord) || sWord.includes(bWord)) {
          console.log(`✓ Word match: "${bWord}" matches "${sWord}"`);
          return true;
        }
      }
    }
    
    // Contains match as fallback
    if (business.includes(search) || search.includes(business)) {
      console.log('✓ Contains match');
      return true;
    }
    
    console.log('✗ No match found');
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
        console.log('=== FETCHING BUSINESSES FROM SUPABASE ===');
        console.log('Category from URL:', categoryName);
        console.log('Formatted category:', formattedCategoryName);
        
        // Fetch all businesses from Supabase
        const { data: allBusinesses, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .order('name', { ascending: true });
        
        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          throw fetchError;
        }
        
        console.log('Total businesses fetched from Supabase:', allBusinesses?.length || 0);
        
        if (!allBusinesses || allBusinesses.length === 0) {
          console.log('No businesses found in Supabase database');
          setBusinesses([]);
          setLoading(false);
          return;
        }
        
        // Log sample of business categories for debugging
        console.log('Sample business categories from database:', 
          allBusinesses.slice(0, 5).map(b => ({ name: b.name, category: b.category }))
        );
        
        // Create search variations
        const searchVariations = [
          formattedCategoryName.toLowerCase(),
          categoryName?.replace(/-/g, ' ').toLowerCase(),
          categoryName?.replace(/-/g, '').toLowerCase(),
          formattedCategoryName.replace(/s$/, '').toLowerCase(), // singular
          (formattedCategoryName + 's').toLowerCase(), // plural
        ].filter(Boolean).filter((term, index, arr) => arr.indexOf(term) === index);
        
        console.log('Search variations:', searchVariations);
        
        // Filter businesses based on category matching
        const matchingBusinesses = allBusinesses.filter(business => {
          if (!business.category) {
            return false;
          }
          
          const matches = searchVariations.some(searchTerm => 
            categorizeBusiness(business.category, searchTerm)
          );
          
          if (matches) {
            console.log(`✓ "${business.name}" (${business.category}) matches category`);
          }
          
          return matches;
        });
        
        console.log('=== MATCHING RESULTS ===');
        console.log('Total matching businesses:', matchingBusinesses.length);
        console.log('Matching business names:', matchingBusinesses.map(b => b.name));
        
        // Convert to our Business type
        const processedBusinesses = matchingBusinesses.map(business => ({
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
        
        setBusinesses(processedBusinesses);
      } catch (err) {
        console.error('Error loading businesses:', err);
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
