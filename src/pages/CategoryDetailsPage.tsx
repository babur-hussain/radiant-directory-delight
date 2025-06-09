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
    
    return taglines[category] || `Discover the best ${category.toLowerCase()} businesses`;
  };
  
  // Enhanced function to get related categories with comprehensive mapping
  const getRelatedCategories = (searchCategory: string): string[] => {
    const categoryRelations: Record<string, string[]> = {
      // Food & Dining
      'food': ['restaurant', 'fast food', 'indian restaurant', 'asian', 'vegetarian', 'biryani', 'breakfast', 'dhaba', 'chicken', 'pizza', 'ice cream', 'north indian', 'punjabi', 'cafe', 'coffee shop', 'snack bar', 'italian', 'pizza takeout', 'salad', 'bakery and cake shop', 'cake shop', 'sweet shop', 'chocolate shop'],
      'restaurant': ['indian restaurant', 'asian', 'vegetarian', 'north indian', 'punjabi', 'dhaba', 'fast food', 'cafe', 'wok restaurant', 'italian'],
      'dining': ['restaurant', 'fast food', 'indian restaurant', 'cafe', 'coffee shop', 'dhaba', 'biryani', 'pizza'],
      'cafe': ['coffee shop', 'restaurant', 'snack bar', 'breakfast'],
      
      // Shopping & Retail
      'shopping': ['clothing store', 'store', 'hypermarket', 'shopping mall', 'gift shop', 'stationery store', 'electronics store', 'furniture store', 'shoe store', 'book store', 'grocery store'],
      'store': ['clothing store', 'electronics store', 'grocery store', 'furniture store', 'shoe store', 'book store', 'stationery store', 'gift shop', 'general store'],
      'clothing': ['clothing store', 'clothing wholesaler', 'men\'s clothing store', 'women\'s clothing store', 'children\'s clothing store', 'baby clothing store', 'youth clothing store', 'plus size clothing store', 'designer clothing store', 'saree shop', 'bridal shop', 'tuxedo shop'],
      
      // Education
      'education': ['school', 'coaching center', 'library', 'education center', 'cbse school', 'computer training school', 'government school', 'middle school', 'elementary school', 'preschool', 'kindergarten school', 'private educational institution', 'tutoring service', 'civil examinations academy', 'software training institute', 'dance school'],
      'school': ['cbse school', 'government school', 'middle school', 'elementary school', 'preschool', 'kindergarten school', 'computer training school', 'private educational institution'],
      
      // Healthcare
      'healthcare': ['hospital', 'medical clinic', 'medical center', 'private hospital', 'children\'s hospital', 'pharmacy', 'medical supply store', 'eye care', 'dialysis center', 'pediatrician', 'obstetrician-gynecologist', 'gynecologist'],
      'medical': ['hospital', 'medical clinic', 'medical center', 'pharmacy', 'medical supply store', 'pediatrician', 'gynecologist'],
      'hospital': ['private hospital', 'children\'s hospital', 'medical center', 'medical clinic'],
      
      // Automotive
      'automotive': ['car dealer', 'auto repair', 'vehicle dealer', 'truck dealer', 'used car dealer', 'renault dealer', 'suzuki dealer', 'ford dealer', 'motor vehicle dealer', 'motorcycle shop', 'auto parts store', 'car stereo store', 'car repair and maintenance service', 'truck repair shop', 'auto dent removal service station', 'electric motor scooter dealer', 'auto accessories', 'car wash'],
      'car': ['car dealer', 'auto repair', 'used car dealer', 'renault dealer', 'suzuki dealer', 'ford dealer', 'car stereo store', 'car repair and maintenance service', 'car wash'],
      'auto': ['auto repair', 'auto parts store', 'auto accessories', 'auto dent removal service station'],
      
      // Beauty & Wellness
      'beauty': ['beauty parlour', 'hair salon', 'hairdresser', 'nail salon', 'make-up artist', 'mehndi designer', 'beautician', 'barber shop', 'massage spa'],
      'salon': ['beauty parlour', 'hair salon', 'nail salon', 'barber shop'],
      'spa': ['massage spa', 'beauty parlour'],
      
      // Technology
      'technology': ['computer store', 'electronics store', 'mobile phone repair shop', 'computer repair service', 'computer support and services', 'software company', 'software training institute', 'internet cafe', 'cell phone store'],
      'computer': ['computer store', 'computer repair service', 'computer training school', 'computer support and services'],
      'electronics': ['electronics store', 'electronics accessories wholesaler', 'electronics wholesaler', 'electrical products wholesaler', 'electrical supply store'],
      
      // Fitness & Sports
      'fitness': ['fitness center', 'gym', 'sports complex', 'sports nutrition store', 'weight loss service'],
      'gym': ['fitness center', 'sports complex', 'weight loss service'],
      'sports': ['sporting goods store', 'sports complex', 'sports nutrition store', 'sports accessories wholesaler'],
      
      // Home & Construction
      'home': ['furniture store', 'home goods store', 'hardware store', 'tile store', 'bathroom supply store', 'kitchen supply store', 'curtain supplier and maker', 'building materials store', 'plywood supplier', 'countertop store', 'furniture maker', 'interior decorator', 'carpenter'],
      'furniture': ['furniture store', 'furniture maker', 'home goods store', 'mattress store'],
      'hardware': ['hardware store', 'building materials store', 'tile store', 'plywood supplier'],
      
      // Wholesale & Manufacturing
      'wholesale': ['clothing wholesaler', 'stationery wholesaler', 'electronics accessories wholesaler', 'agricultural product wholesaler', 'disposable items shop', 'oil wholesaler', 'sports accessories wholesaler', 'battery wholesaler', 'electrical products wholesaler', 'fmcg goods wholesaler', 'electronics wholesaler', 'footwear wholesaler', 'wholesale bakery', 'vegetable wholesale market', 'wholesale market', 'clothing wholesale market place'],
      'wholesaler': ['clothing wholesaler', 'stationery wholesaler', 'electronics accessories wholesaler', 'agricultural product wholesaler', 'oil wholesaler', 'sports accessories wholesaler', 'battery wholesaler', 'electrical products wholesaler', 'fmcg goods wholesaler', 'electronics wholesaler', 'footwear wholesaler'],
      
      // Services
      'service': ['printing services', 'chauffeur service', 'computer repair service', 'car repair and maintenance service', 'weight loss service', 'wedding service', 'photography service', 'tutoring service'],
      'repair': ['auto repair', 'computer repair service', 'mobile phone repair shop', 'car repair and maintenance service', 'truck repair shop'],
      
      // Events & Entertainment
      'wedding': ['wedding services', 'wedding service', 'bridal shop', 'banquet hall', 'event venue', 'tuxedo shop', 'jewelry designer'],
      'event': ['wedding services', 'banquet hall', 'event venue', 'photography service'],
      
      // Hospitality
      'hotel': ['lodging', 'boys\' hostel'],
      'accommodation': ['hotel', 'lodging', 'boys\' hostel'],
      
      // Others
      'grocery': ['grocery store', 'indian grocery store', 'asian grocery store', 'general store', 'fruit & vegetable store', 'produce market', 'dairy store'],
      'jewelry': ['jeweler', 'jewelry designer'],
      'stationery': ['stationery store', 'stationery wholesaler', 'pen store'],
      'baby': ['baby clothing store', 'baby store', 'children\'s clothing store', 'children\'s hospital', 'kindergarten school']
    };
    
    const lowerSearch = searchCategory.toLowerCase();
    const relatedCategories: Set<string> = new Set();
    
    // Direct keyword matching
    for (const [key, values] of Object.entries(categoryRelations)) {
      if (lowerSearch.includes(key) || values.some(v => lowerSearch.includes(v.toLowerCase()))) {
        values.forEach(category => relatedCategories.add(category));
        relatedCategories.add(key);
      }
    }
    
    // Add partial matches for common keywords
    const keywords = lowerSearch.split(/\s+|[-_]/);
    keywords.forEach(keyword => {
      for (const [key, values] of Object.entries(categoryRelations)) {
        if (key.includes(keyword) || values.some(v => v.toLowerCase().includes(keyword))) {
          values.forEach(category => relatedCategories.add(category));
        }
      }
    });
    
    return Array.from(relatedCategories);
  };
  
  // Enhanced fuzzy matching function
  const isRelatedCategory = (businessCategory: string, searchTerms: string[]): boolean => {
    const lowerBusinessCategory = businessCategory.toLowerCase();
    
    return searchTerms.some(term => {
      const lowerTerm = term.toLowerCase();
      
      // Exact match
      if (lowerBusinessCategory === lowerTerm) return true;
      
      // Contains match
      if (lowerBusinessCategory.includes(lowerTerm) || lowerTerm.includes(lowerBusinessCategory)) return true;
      
      // Word-based matching
      const businessWords = lowerBusinessCategory.split(/\s+|[-_']/);
      const termWords = lowerTerm.split(/\s+|[-_']/);
      
      // Check if any business words match any term words
      const hasWordMatch = businessWords.some(bWord => 
        termWords.some(tWord => 
          bWord === tWord || 
          bWord.includes(tWord) || 
          tWord.includes(bWord) ||
          (bWord.length > 3 && tWord.length > 3 && 
           (bWord.startsWith(tWord.substring(0, 3)) || tWord.startsWith(bWord.substring(0, 3))))
        )
      );
      
      if (hasWordMatch) return true;
      
      // Levenshtein distance for similar spellings
      const distance = getLevenshteinDistance(lowerBusinessCategory, lowerTerm);
      const maxLength = Math.max(lowerBusinessCategory.length, lowerTerm.length);
      const similarity = 1 - (distance / maxLength);
      
      return similarity > 0.7; // 70% similarity threshold
    });
  };
  
  // Levenshtein distance function for fuzzy matching
  const getLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
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
          setMatchedCategories([]);
          setLoading(false);
          return;
        }
        
        // Get related category keywords
        const relatedCategories = getRelatedCategories(formattedCategoryName);
        const searchTerms = [
          formattedCategoryName,
          categoryName?.replace(/-/g, ' '),
          ...relatedCategories
        ].filter(Boolean);
        
        console.log('Search terms:', searchTerms);
        
        // Filter businesses based on enhanced fuzzy category matching
        const matchingBusinesses = allBusinesses.filter(business => {
          if (!business.category) return false;
          return isRelatedCategory(business.category, searchTerms);
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
                    Including: {matchedCategories.slice(0, 5).join(', ')}{matchedCategories.length > 5 ? ` and ${matchedCategories.length - 5} more` : ''}
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
