
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
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
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onResultsVisibilityChange,
  className
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [followers, setFollowers] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const categories = [
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

  const handleSearch = () => {
    console.log('Searching with:', { query, category, city, followers });
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

  return (
    <div className={cn("w-full space-y-3 sm:space-y-4", className)}>
      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search creators, niches, or keywords..."
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
            {categories.map((cat) => (
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
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Search className="h-4 w-4 mr-2" />
        Search Creators
      </Button>
    </div>
  );
};

export default SearchBar;
