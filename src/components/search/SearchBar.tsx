
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchResults from '@/components/SearchResults';
import { useBusinessPageData } from '@/hooks/useBusinessPageData';

interface SearchBarProps {
  initialQuery?: string;
  onResultsVisibilityChange?: (visible: boolean) => void;
  className?: string;
  onSearch?: (params: {
    query: string;
    category: string;
    city: string;
    filters: string;
  }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onResultsVisibilityChange,
  className,
  onSearch
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [filters, setFilters] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Get business data for search results
  const { loading, filteredBusinesses } = useBusinessPageData(query);

  // Combined categories for both influencers and businesses
  const allCategories = [
    { value: 'all', label: 'All Categories' },
    // Influencer categories
    { value: 'music-dance', label: '🎤 Music & Dance' },
    { value: 'entertainment-comedy', label: '🎭 Entertainment & Comedy' },
    { value: 'gaming-tech', label: '🎮 Gaming & Tech' },
    { value: 'fitness-health', label: '🏋️ Fitness & Health' },
    { value: 'fashion-lifestyle', label: '👗 Fashion & Lifestyle' },
    { value: 'food-travel', label: '🍽️ Food & Travel' },
    { value: 'beauty-makeup', label: '💄 Beauty & Makeup' },
    { value: 'business-finance', label: '💼 Business & Finance' },
    { value: 'education-knowledge', label: '📚 Education & Knowledge' },
    { value: 'art-photography', label: '🎨 Art & Photography' },
    // Business categories
    { value: 'restaurant', label: '🍽️ Restaurant & Food Service' },
    { value: 'retail', label: '🛍️ Retail & Shopping' },
    { value: 'services', label: '🔧 Professional Services' },
    { value: 'healthcare', label: '🏥 Healthcare & Medical' },
    { value: 'technology', label: '💻 Technology & Software' },
    { value: 'automotive', label: '🚗 Automotive & Transport' },
    { value: 'real-estate', label: '🏠 Real Estate & Property' },
    { value: 'entertainment', label: '🎬 Entertainment & Media' }
  ];

  const cities = [
    { value: 'all', label: 'All Cities' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'faridabad', label: 'Faridabad' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'pune', label: 'Pune' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'gurgaon', label: 'Gurgaon' },
    { value: 'noida', label: 'Noida' }
  ];

  // Combined filters for both types
  const filterOptions = [
    { value: 'all', label: 'All Results' },
    { value: 'influencers', label: 'Influencers Only' },
    { value: 'businesses', label: 'Businesses Only' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'verified', label: 'Verified Only' },
    { value: 'high-rated', label: 'High Rated (4+ Stars)' },
    { value: 'recent', label: 'Recently Added' }
  ];

  const handleSearch = () => {
    console.log('Searching with:', { 
      query, 
      category, 
      city, 
      filters 
    });
    
    if (query.length > 0) {
      setShowResults(true);
      setIsLoading(true);
      
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
    
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(query.length > 0);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('all');
    setCity('all');
    setFilters('all');
    setShowResults(false);
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (id: number) => {
    console.log('Result clicked:', id);
    // Navigate to business detail page or handle result click
    window.location.href = `/business/${id}`;
  };

  const handleCloseResults = () => {
    setShowResults(false);
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(false);
    }
  };

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        handleSearch();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else if (query.length === 0) {
      setShowResults(false);
      if (onResultsVisibilityChange) {
        onResultsVisibilityChange(false);
      }
    }
  }, [query]);

  // Transform business data to match SearchResults interface
  const searchResults = filteredBusinesses.map(business => ({
    id: business.id,
    name: business.name,
    category: business.category,
    image: business.image || '/placeholder.svg',
    rating: business.rating,
    reviews: business.reviews,
    address: business.address || '',
    description: business.description || '',
    tags: business.tags || [],
    location: business.address ? business.address.split(',').pop()?.trim() || '' : ''
  }));

  return (
    <div className={cn("w-full space-y-3 sm:space-y-4 relative", className)}>
      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search influencers, businesses, services, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base h-10 sm:h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg sm:rounded-xl"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
            {allCategories.map((cat) => (
              <SelectItem 
                key={cat.value} 
                value={cat.value}
                className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2"
              >
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
            {cities.map((cityItem) => (
              <SelectItem 
                key={cityItem.value} 
                value={cityItem.value}
                className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2"
              >
                {cityItem.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters} onValueChange={setFilters}>
          <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
            <SelectValue placeholder="All Results" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
            {filterOptions.map((filter) => (
              <SelectItem 
                key={filter.value} 
                value={filter.value}
                className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2"
              >
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2">
          <SearchResults
            results={searchResults}
            isLoading={isLoading || loading}
            visible={showResults}
            onResultClick={handleResultClick}
            onClose={handleCloseResults}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
