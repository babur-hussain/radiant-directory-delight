
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
  const [matchedCategories, setMatchedCategories] = useState<string[]>([]);
  
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
    
    return taglines[category] || `Discover the best ${category} businesses`;
  };
  
  // Function to get related categories based on keywords
  const getRelatedCategories = (searchCategory: string): string[] => {
    const categoryRelations: Record<string, string[]> = {
      'food': ['restaurants', 'dining', 'cafe', 'catering', 'food service', 'bakery', 'pizza', 'fast food'],
      'restaurant': ['restaurants', 'dining', 'cafe', 'catering', 'food service', 'bakery', 'pizza', 'fast food'],
      'dining': ['restaurants', 'dining', 'cafe', 'catering', 'food service', 'bakery', 'pizza', 'fast food'],
      'hotel': ['hotels', 'accommodation', 'lodging', 'resort', 'motel', 'inn', 'hospitality'],
      'shop': ['shopping', 'retail', 'store', 'market', 'boutique', 'mall'],
      'shopping': ['shopping', 'retail', 'store', 'market', 'boutique', 'mall'],
      'health': ['healthcare', 'medical', 'clinic', 'hospital', 'wellness', 'fitness', 'pharmacy'],
      'medical': ['healthcare', 'medical', 'clinic', 'hospital', 'wellness', 'pharmacy'],
      'car': ['automotive', 'auto', 'vehicle', 'garage', 'repair', 'service'],
      'auto': ['automotive', 'auto', 'vehicle', 'garage', 'repair', 'service'],
      'beauty': ['beauty', 'salon', 'spa', 'cosmetic', 'hair', 'nail', 'massage'],
      'salon': ['beauty', 'salon', 'spa', 'cosmetic', 'hair', 'nail', 'massage'],
      'tech': ['technology', 'IT', 'computer', 'software', 'digital', 'electronics'],
      'technology': ['technology', 'IT', 'computer', 'software', 'digital', 'electronics'],
      'fitness': ['fitness', 'gym', 'sport', 'exercise', 'training', 'wellness', 'health'],
      'gym': ['fitness', 'gym', 'sport', 'exercise', 'training', 'wellness'],
      'education': ['education', 'school', 'training', 'course', 'learning', 'academy', 'institute'],
      'school': ['education', 'school', 'training', 'course', 'learning', 'academy', 'institute'],
      'entertainment': ['entertainment', 'event', 'party', 'music', 'show', 'venue', 'recreation'],
      'event': ['entertainment', 'event', 'party', 'music', 'show', 'venue', 'recreation'],
      'repair': ['repair', 'service', 'maintenance', 'fix', 'restoration'],
      'service': ['service', 'repair', 'maintenance', 'professional', 'consulting'],
      'home': ['home services', 'household', 'cleaning', 'maintenance', 'repair', 'construction'],
      'house': ['home services', 'household', 'cleaning', 'maintenance', 'repair', 'construction'],
      'legal': ['legal', 'law', 'attorney', 'lawyer', 'court', 'advice'],
      'law': ['legal', 'law', 'attorney', 'lawyer', 'court', 'advice'],
      'finance': ['financial', 'banking', 'investment', 'insurance', 'accounting', 'money'],
      'financial': ['financial', 'banking', 'investment', 'insurance', 'accounting', 'money'],
      'pet': ['pet services', 'animal', 'veterinary', 'grooming', 'care'],
      'animal': ['pet services', 'animal', 'veterinary', 'grooming', 'care'],
      'travel': ['travel', 'tourism', 'tour', 'vacation', 'trip', 'booking'],
      'tourism': ['travel', 'tourism', 'tour', 'vacation', 'trip', 'booking']
    };
    
    const lowerSearch = searchCategory.toLowerCase();
    for (const [key, values] of Object.entries(categoryRelations)) {
      if (lowerSearch.includes(key) || values.some(v => lowerSearch.includes(v))) {
        return values;
      }
    }
    return [];
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
        
        // Get all businesses first to analyze categories
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
          setMatchedCategories([]);
          setLoading(false);
          return;
        }
        
        // Get related category keywords
        const relatedCategories = getRelatedCategories(formattedCategoryName);
        const searchTerms = [
          formattedCategoryName,
          categoryName?.replace('-', ' '),
          ...relatedCategories
        ].filter(Boolean);
        
        console.log('Search terms:', searchTerms);
        
        // Filter businesses based on fuzzy category matching
        const matchingBusinesses = allBusinesses.filter(business => {
          if (!business.category) return false;
          
          const businessCategory = business.category.toLowerCase();
          const searchCategory = formattedCategoryName.toLowerCase();
          
          // Exact match
          if (businessCategory === searchCategory) return true;
          
          // Partial match
          if (businessCategory.includes(searchCategory) || searchCategory.includes(businessCategory)) return true;
          
          // Check against related categories
          return searchTerms.some(term => {
            const lowerTerm = term.toLowerCase();
            return businessCategory.includes(lowerTerm) || lowerTerm.includes(businessCategory);
          });
        });
        
        console.log('Matching businesses found:', matchingBusinesses.length);
        
        // Get unique matched categories
        const uniqueCategories = Array.from(new Set(
          matchingBusinesses.map(b => b.category).filter(Boolean)
        ));
        setMatchedCategories(uniqueCategories);
        
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
                  {matchedCategories.length > 1 && ' and related categories'}
                </p>
                {matchedCategories.length > 1 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Including: {matchedCategories.join(', ')}
                  </p>
                )}
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
