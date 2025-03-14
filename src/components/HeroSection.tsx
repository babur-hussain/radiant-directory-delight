
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { businessesData } from '@/data/businessesData';
import SearchResults, { BusinessResult } from './SearchResults';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BusinessResult[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
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

  // Handle search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        
        // Simulate API call with a delay
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

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    // Navigate to businesses page with search params
    navigate(`/businesses?search=${searchQuery}&location=${location}`);
  };

  const handleResultClick = (id: number) => {
    // Navigate to business details page
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
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23000000" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '600px 600px',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 z-10 animate-fade-up">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              Find the best local businesses
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 text-balance max-w-4xl">
            Discover, Connect, and Engage with 
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"> Local Excellence</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl">
            Your comprehensive directory for finding the best businesses, services, and professionals in your area.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <div ref={searchContainerRef} className="relative">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col md:flex-row">
                {/* Search Input */}
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

                {/* Location Selector */}
                <div className="relative">
                  <div
                    className="flex items-center w-full md:w-52 px-4 py-5 cursor-pointer"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  >
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{location}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>

                  {/* Location Dropdown */}
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

                {/* Search Button */}
                <Button
                  className="m-3 md:m-2 rounded-lg transition-smooth"
                  size="lg"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            <SearchResults 
              results={searchResults}
              isLoading={isSearching}
              visible={showResults}
              onResultClick={handleResultClick}
            />
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-sm text-gray-500">
            <span>Popular:</span>
            {['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto Services'].map((term) => (
              <button
                key={term}
                className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-gray-100 transition-smooth"
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
