
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { businessesData } from '@/data/businessesData';
import SearchResults, { BusinessResult } from '../SearchResults';

// Define locations for dropdown
const locations = [
  'New York', 
  'Los Angeles', 
  'Chicago', 
  'Houston', 
  'Phoenix', 
  'Philadelphia', 
  'San Antonio', 
  'San Diego', 
  'Dallas'
];

interface SearchBarProps {
  initialQuery?: string;
  onResultsVisibilityChange?: (isVisible: boolean) => void;
}

const SearchBar = ({ 
  initialQuery = '', 
  onResultsVisibilityChange 
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState('New York');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BusinessResult[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Update searchQuery when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Notify parent component when results visibility changes
  useEffect(() => {
    if (onResultsVisibilityChange) {
      onResultsVisibilityChange(showResults);
    }
  }, [showResults, onResultsVisibilityChange]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        
        setTimeout(() => {
          const results = businessesData.filter(business => 
            business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          
          setSearchResults(results);
          setIsSearching(false);
          setShowResults(true);
        }, 300);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    navigate(`/businesses?search=${searchQuery}&location=${location}`);
  };

  const handleResultClick = (id: number) => {
    navigate(`/business?id=${id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative flex-grow border-b md:border-b-0 md:border-r border-gray-100">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-10 py-5 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500"
              placeholder="Search for businesses, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={handleClearSearch}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="relative">
            <div
              className="flex items-center w-full md:w-52 px-4 py-5 cursor-pointer"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-gray-900 truncate">{location}</span>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
            </div>

            <div
              className={cn(
                "absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md py-1 transition-all duration-200 border border-gray-100",
                showLocationDropdown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              {locations.map((loc) => (
                <div
                  key={loc}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm"
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="m-3 md:m-2 rounded-lg transition-smooth"
            size="lg"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>

      <SearchResults 
        results={searchResults}
        isLoading={isSearching}
        visible={showResults}
        onResultClick={handleResultClick}
        onClose={() => setShowResults(false)}
      />
    </div>
  );
};

export default SearchBar;
