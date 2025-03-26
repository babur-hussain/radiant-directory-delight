import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Business, ensureTagsArray, parseHours, formatBusiness } from '@/lib/csv-utils';
import { toast } from '@/hooks/use-toast';

const useBusinessPageData = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Helper to ensure tags is always an array for operations
  const ensureTags = (tags: string | string[] | null | undefined): string[] => {
    return ensureTagsArray(tags);
  };
  
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order(sortBy, { ascending: sortDirection === 'asc' });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Process the data and convert to Business type with proper hours handling
          const formattedBusinesses: Business[] = data.map(item => ({
            id: item.id,
            name: item.name || '',
            category: item.category || '',
            description: item.description || '',
            address: item.address || '',
            phone: item.phone || '',
            email: item.email || '',
            website: item.website || '',
            image: item.image || '',
            hours: parseHours(item.hours), // Use the parseBusinessHours helper
            rating: Number(item.rating) || 0,
            reviews: Number(item.reviews) || 0,
            featured: Boolean(item.featured),
            tags: ensureTagsArray(item.tags),
            latitude: item.latitude || 0,
            longitude: item.longitude || 0,
            created_at: item.created_at || '',
            updated_at: item.updated_at || ''
          }));
          
          setBusinesses(formattedBusinesses);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(
            formattedBusinesses
              .map(b => b.category)
              .filter(Boolean)
          ));
          setCategories(uniqueCategories as string[]);
          
          // Extract all tags
          const allTags: string[] = [];
          formattedBusinesses.forEach(business => {
            const businessTags = ensureTags(business.tags);
            if (Array.isArray(businessTags)) {
              businessTags.forEach(tag => {
                if (!allTags.includes(tag)) {
                  allTags.push(tag);
                }
              });
            }
          });
          setTags(allTags);
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load businesses',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [sortBy, sortDirection]);
  
  // Function to filter businesses by category
  const filterByCategory = (category: string | null) => {
    setVisibleCategory(category);
  };
  
  // Function to filter businesses by tags
  const filterByTags = (tags: string[]) => {
    setSelectedTags(tags);
  };
  
  // Get filtered businesses
  const getFilteredBusinesses = (): Business[] => {
    let filtered = [...businesses];
    
    // Filter by category if selected
    if (visibleCategory) {
      filtered = filtered.filter(business => business.category === visibleCategory);
    }
    
    // Filter by selected tags if any
    if (selectedTags.length > 0) {
      filtered = filtered.filter(business => {
        const businessTags = ensureTags(business.tags);
        return selectedTags.some(tag => businessTags.includes(tag));
      });
    }
    
    return filtered;
  };
  
  // Function to sort businesses
  const sortBusinesses = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortDirection(direction);
  };
  
  return {
    businesses,
    categories,
    tags,
    loading,
    error,
    visibleCategory,
    selectedTags,
    filterByCategory,
    filterByTags,
    getFilteredBusinesses,
    sortBusinesses,
    sortBy,
    sortDirection
  };
};

export default useBusinessPageData;
