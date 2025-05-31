
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface SearchBarProps {
  initialQuery?: string;
  onResultsVisibilityChange?: (visible: boolean) => void;
  className?: string;
  searchType?: 'influencers' | 'businesses' | 'both';
  onSearchTypeChange?: (type: 'influencers' | 'businesses' | 'both') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onResultsVisibilityChange,
  className,
  searchType = 'both',
  onSearchTypeChange
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [currentSearchType, setCurrentSearchType] = useState(searchType);
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [followers, setFollowers] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Categories for influencers
  const influencerCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'music-dance', label: '🎤 Music & Dance' },
    { value: 'entertainment-comedy', label: '🎭 Entertainment & Comedy' },
    { value: 'gaming-tech', label: '🎮 Gaming & Tech' },
    { value: 'fitness-health', label: '🏋️ Fitness & Health' },
    { value: 'fashion-lifestyle', label: '👗 Fashion & Lifestyle' },
    { value: 'food-travel', label: '🍽️ Food & Travel' },
    { value: 'beauty-makeup', label: '💄 Beauty & Makeup' },
    { value: 'business-finance', label: '💼 Business & Finance' },
    { value: 'education-knowledge', label: '📚 Education & Knowledge' },
    { value: 'art-photography', label: '🎨 Art & Photography' }
  ];

  // Categories for businesses
  const businessCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'restaurant', label: '🍽️ Restaurant & Food' },
    { value: 'retail', label: '🛍️ Retail & Shopping' },
    { value: 'services', label: '🔧 Services' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'education', label: '📚 Education' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'automotive', label: '🚗 Automotive' },
    { value: 'real-estate', label: '🏠 Real Estate' },
    { value: 'fitness', label: '🏋️ Fitness & Wellness' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'professional', label: '💼 Professional Services' }
  ];

  // Get current categories based on search type
  const getCurrentCategories = () => {
    if (currentSearchType === 'influencers') return influencerCategories;
    if (currentSearchType === 'businesses') return businessCategories;
    // For 'both', combine categories
    return [
      { value: 'all', label: 'All Categories' },
      ...influencerCategories.slice(1).map(cat => ({ ...cat, label: `👤 ${cat.label}` })),
      ...businessCategories.slice(1).map(cat => ({ ...cat, label: `🏢 ${cat.label}` }))
    ];
  };

  const cities = [
    { value: 'all', label: 'All Cities' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'faridabad', label: 'Faridabad' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'pune', label: 'Pune' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'chennai', label: 'Chennai' }
  ];

  const followerRanges = [
    { value: 'all', label: 'Followers' },
    { value: '1k-10k', label: '1K - 10K' },
    { value: '10k-50k', label: '10K - 50K' },
    { value: '50k-100k', label: '50K - 100K' },
    { value: '100k-500k', label: '100K - 500K' },
    { value: '500k-1m', label: '500K - 1M' },
    { value: '1m+', label: '1M+' }
  ];

  const handleSearchTypeChange = (type: 'influencers' | 'businesses' | 'both') => {
    setCurrentSearchType(type);
    setCategory('all'); // Reset category when changing search type
    if (onSearchTypeChange) {
      onSearchTypeChange(type);
    }
  };

  const handleSearch = () => {
    console.log('Searching with:', { 
      query, 
      searchType: currentSearchType, 
      category, 
      city, 
      followers 
    });
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(true);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('all');
    setCity('all');
    setFollowers('all');
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getPlaceholderText = () => {
    switch (currentSearchType) {
      case 'influencers':
        return 'Search creators, niches, or keywords...';
      case 'businesses':
        return 'Search businesses, services, or keywords...';
      default:
        return 'Search creators, businesses, or keywords...';
    }
  };

  const getSearchButtonText = () => {
    switch (currentSearchType) {
      case 'influencers':
        return 'Search Creators';
      case 'businesses':
        return 'Search Businesses';
      default:
        return 'Search All';
    }
  };

  return (
    <div className={cn("w-full space-y-3 sm:space-y-4", className)}>
      {/* Search Type Toggle */}
      <div className="flex items-center justify-center space-x-2 bg-gray-100 p-1 rounded-xl">
        <Button
          variant={currentSearchType === 'influencers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSearchTypeChange('influencers')}
          className={cn(
            "flex items-center gap-2 rounded-lg transition-all duration-200",
            currentSearchType === 'influencers' 
              ? "bg-purple-600 text-white shadow-lg" 
              : "text-gray-600 hover:text-purple-600 hover:bg-white"
          )}
        >
          <Users className="h-4 w-4" />
          Influencers
        </Button>
        <Button
          variant={currentSearchType === 'businesses' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSearchTypeChange('businesses')}
          className={cn(
            "flex items-center gap-2 rounded-lg transition-all duration-200",
            currentSearchType === 'businesses' 
              ? "bg-blue-600 text-white shadow-lg" 
              : "text-gray-600 hover:text-blue-600 hover:bg-white"
          )}
        >
          <Building2 className="h-4 w-4" />
          Businesses
        </Button>
        <Button
          variant={currentSearchType === 'both' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSearchTypeChange('both')}
          className={cn(
            "flex items-center gap-2 rounded-lg transition-all duration-200",
            currentSearchType === 'both' 
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
              : "text-gray-600 hover:text-purple-600 hover:bg-white"
          )}
        >
          Both
        </Button>
      </div>

      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholderText()}
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
        
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="ml-2 px-3 h-10 border-gray-200 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={cn(
        "grid gap-2 sm:gap-3 transition-all duration-300",
        isMobile ? (
          showFilters ? "grid-cols-1 opacity-100" : "grid-cols-1 h-0 overflow-hidden opacity-0"
        ) : "grid-cols-1 sm:grid-cols-3 opacity-100"
      )}>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
            {getCurrentCategories().map((cat) => (
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

        {/* Show followers filter only for influencers or both */}
        {currentSearchType !== 'businesses' && (
          <Select value={followers} onValueChange={setFollowers}>
            <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Followers" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
              {followerRanges.map((range) => (
                <SelectItem 
                  key={range.value} 
                  value={range.value}
                  className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2"
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Show rating filter only for businesses */}
        {currentSearchType === 'businesses' && (
          <Select value={followers} onValueChange={setFollowers}>
            <SelectTrigger className="h-10 sm:h-11 text-sm bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
              <SelectItem value="all" className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2">
                All Ratings
              </SelectItem>
              <SelectItem value="4+" className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2">
                4+ Stars
              </SelectItem>
              <SelectItem value="3+" className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2">
                3+ Stars
              </SelectItem>
              <SelectItem value="2+" className="hover:bg-gray-50 focus:bg-gray-50 text-sm py-2">
                2+ Stars
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        className={cn(
          "w-full h-10 sm:h-12 text-white font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl",
          currentSearchType === 'influencers' 
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            : currentSearchType === 'businesses'
            ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        )}
      >
        <Search className="h-4 w-4 mr-2" />
        {getSearchButtonText()}
      </Button>
    </div>
  );
};

export default SearchBar;
