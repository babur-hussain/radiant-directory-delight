
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { businessesData } from '@/data/businessesData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Get the first 6 businesses to display
const featuredBusinesses = businessesData.filter(b => b.featured).slice(0, 6);

const BusinessCard = ({ business }: { business: typeof businessesData[0] }) => {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-smooth">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {business.featured && (
          <span className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
            Featured
          </span>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {business.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index} 
              className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-smooth">
            {business.name}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-700 ml-1">{business.rating}</span>
            <span className="text-xs text-gray-400 ml-1">({business.reviews})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{business.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{business.address}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{business.phone}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">{business.category}</span>
        <Link 
          to={`/businesses?category=${encodeURIComponent(business.category)}`}
          className="flex items-center text-xs font-medium text-primary hover:text-primary/90 transition-smooth"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  );
};

const FeaturedBusinesses = () => {
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const categories = Array.from(new Set(featuredBusinesses.map(b => b.category)));
  
  // Extract unique locations (cities) from business addresses
  const locations = Array.from(new Set(featuredBusinesses.map(b => {
    const parts = b.address.split(',');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  })));
  
  // Filter businesses based on all selected filters
  const filteredBusinesses = featuredBusinesses.filter(business => {
    // Category filter
    if (visibleCategory && business.category !== visibleCategory) {
      return false;
    }
    
    // Rating filter
    if (selectedRating) {
      const minRating = parseInt(selectedRating.replace('+', ''));
      if (business.rating < minRating) {
        return false;
      }
    }
    
    // Location filter
    if (selectedLocation) {
      const businessLocation = business.address.split(',');
      const cityPart = businessLocation.length > 1 ? businessLocation[1].trim() : businessLocation[0].trim();
      if (cityPart !== selectedLocation) {
        return false;
      }
    }
    
    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setVisibleCategory(null);
    setSelectedRating(null);
    setSelectedLocation(null);
  };

  // Update URL with filters when they change
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (visibleCategory) {
      searchParams.set('category', visibleCategory);
    }
    
    if (selectedRating) {
      searchParams.set('rating', selectedRating);
    }
    
    if (selectedLocation) {
      searchParams.set('location', selectedLocation);
    }
    
    // Only update if there are filters
    if (searchParams.toString()) {
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${searchParams.toString()}`
      );
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [visibleCategory, selectedRating, selectedLocation]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Businesses</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Discover top-rated local businesses that consistently deliver exceptional service.
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {/* Category Filter Buttons */}
          <Button
            variant={visibleCategory === null ? "default" : "outline"}
            className="rounded-full text-sm transition-smooth"
            onClick={() => setVisibleCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={visibleCategory === category ? "default" : "outline"}
              className="rounded-full text-sm transition-smooth"
              onClick={() => setVisibleCategory(category)}
            >
              {category}
            </Button>
          ))}
          
          {/* Filter Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="rounded-full ml-2">
                More Filters {(selectedRating || selectedLocation) && '•'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Rating Filter */}
              <div className="px-2 py-1.5 text-sm font-medium">Rating</div>
              <DropdownMenuItem 
                className={!selectedRating ? "bg-accent/50" : ""}
                onClick={() => setSelectedRating(null)}
              >
                Any Rating
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={selectedRating === "4+" ? "bg-accent/50" : ""}
                onClick={() => setSelectedRating("4+")}
              >
                4+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={selectedRating === "3+" ? "bg-accent/50" : ""}
                onClick={() => setSelectedRating("3+")}
              >
                3+ Stars
              </DropdownMenuItem>
              
              {/* Location Filter */}
              <div className="px-2 py-1.5 text-sm font-medium mt-2">Location</div>
              <DropdownMenuItem 
                className={!selectedLocation ? "bg-accent/50" : ""}
                onClick={() => setSelectedLocation(null)}
              >
                Any Location
              </DropdownMenuItem>
              {locations.map(location => (
                <DropdownMenuItem
                  key={location}
                  className={selectedLocation === location ? "bg-accent/50" : ""}
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
                </DropdownMenuItem>
              ))}
              
              {/* Reset Filters */}
              <div className="border-t my-1"></div>
              <DropdownMenuItem onClick={resetFilters}>
                Reset All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active Filters Display */}
        {(selectedRating || selectedLocation) && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <div className="text-sm text-gray-500">Active filters:</div>
            {selectedRating && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs rounded-full gap-1"
                onClick={() => setSelectedRating(null)}
              >
                {selectedRating} Stars
                <span className="ml-1">×</span>
              </Button>
            )}
            {selectedLocation && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs rounded-full gap-1"
                onClick={() => setSelectedLocation(null)}
              >
                {selectedLocation}
                <span className="ml-1">×</span>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          </div>
        )}
        
        {/* Businesses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or view all businesses</p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
        
        {/* View More Button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="rounded-full transition-smooth"
            asChild
          >
            <Link to="/businesses">View All Businesses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
