
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { businessesData } from '@/data/businessesData';
import SearchResults, { BusinessResult } from '../SearchResults';
import { useToast } from '@/hooks/use-toast';

// Define Indian states for dropdown
const locations = [
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

interface SearchBarProps {
  initialQuery?: string;
  onResultsVisibilityChange?: (isVisible: boolean) => void;
}

const SearchBar = ({ 
  initialQuery = '', 
  onResultsVisibilityChange 
}: SearchBarProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState('Madhya Pradesh');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BusinessResult[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
          try {
            const results = businessesData.filter(business => 
              business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            
            setSearchResults(results);
            setShowResults(true);
          } catch (error) {
            console.error("Search error:", error);
            toast({
              title: "Search Error",
              description: "There was a problem with your search. Please try again.",
              variant: "destructive"
            });
          } finally {
            setIsSearching(false);
          }
        }, 300);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
        
        // Only hide search results if user clicks outside both the search container and results
        const resultsElement = document.querySelector('.search-results-container');
        if (resultsElement && !resultsElement.contains(event.target as Node)) {
          setShowResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Handle Escape key to close dropdowns
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLocationDropdown(false);
        setShowResults(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/businesses?search=${searchQuery}&location=${location}`);
    } else {
      // Focus on the search input if empty
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        toast({
          title: "Enter Search Term",
          description: "Please enter what you're looking for.",
        });
      }
    }
  };

  const handleResultClick = (id: number) => {
    setShowResults(false);
    navigate(`/business?id=${id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              ref={searchInputRef}
              type="text"
              className="block w-full pl-12 pr-10 py-5 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500"
              placeholder="Search for businesses, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={handleClearSearch}
                aria-label="Clear search"
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
                "absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-1 transition-all duration-200 border border-gray-100 max-h-64 overflow-y-auto",
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
