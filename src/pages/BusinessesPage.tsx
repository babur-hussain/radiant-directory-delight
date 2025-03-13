import { useState, useEffect, useMemo } from "react";
import { Search, Filter, MapPin, Star, Phone, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { businessesData } from "@/data/businessesData";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type LocationFilter = string | null;
type SortOption = "relevance" | "rating" | "reviews";

const BusinessesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<LocationFilter>(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  const itemsPerPage = 6;
  
  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(businessesData.map(b => b.category)));
  }, []);
  
  // Get unique locations for filter dropdown
  const locations = useMemo(() => {
    // Extract city from address (simplified version - in real app would be more sophisticated)
    return Array.from(new Set(businessesData.map(b => {
      const parts = b.address.split(',');
      return parts.length > 1 ? parts[1].trim() : parts[0].trim();
    })));
  }, []);

  // Get unique tags across all businesses
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    businessesData.forEach(business => {
      business.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);
  
  // Toggle a tag in the active tags list
  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setCurrentPage(1);
  };
  
  // Filter businesses based on all filters
  const filteredBusinesses = useMemo(() => {
    let results = businessesData.filter(business => {
      // Check search query
      const matchesSearch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check category filter
      const matchesCategory = selectedCategory === "" || business.category === selectedCategory;
      
      // Check rating filter
      const matchesRating = selectedRating === "" || 
        (selectedRating === "4+" && business.rating >= 4) ||
        (selectedRating === "3+" && business.rating >= 3) ||
        (selectedRating === "2+" && business.rating >= 2);
        
      // Check featured filter
      const matchesFeatured = !featuredOnly || business.featured;
      
      // Check location filter
      const matchesLocation = !selectedLocation || business.address.includes(selectedLocation);
      
      // Check tags filter
      const matchesTags = activeTags.length === 0 || 
        activeTags.some(tag => business.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesRating && 
             matchesFeatured && matchesLocation && matchesTags;
    });
    
    // Sort the results
    return results.sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      } else if (sortBy === "reviews") {
        return b.reviews - a.reviews;
      }
      // Default: relevance - keep original order or prioritize featured
      return b.featured ? 1 : -1;
    });
  }, [
    searchQuery, 
    selectedCategory, 
    selectedRating, 
    featuredOnly, 
    selectedLocation, 
    activeTags, 
    sortBy
  ]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const currentBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRating, featuredOnly, selectedLocation, activeTags, sortBy]);
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedRating("");
    setFeaturedOnly(false);
    setSearchQuery("");
    setSelectedLocation(null);
    setActiveTags([]);
    setSortBy("relevance");
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedRating) count++;
    if (featuredOnly) count++;
    if (selectedLocation) count++;
    if (activeTags.length > 0) count++;
    return count;
  }, [selectedCategory, selectedRating, featuredOnly, selectedLocation, activeTags]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Local Businesses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the best businesses in your area. Use the search and filters to narrow down your options.
        </p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search businesses by name, description or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 md:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Businesses</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Category</h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Location Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Location</h3>
                    <Select 
                      value={selectedLocation || ""} 
                      onValueChange={val => setSelectedLocation(val || null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Location</SelectItem>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Rating Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Rating</h3>
                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Rating</SelectItem>
                        <SelectItem value="4+">4+ Stars</SelectItem>
                        <SelectItem value="3+">3+ Stars</SelectItem>
                        <SelectItem value="2+">2+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Featured Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured-mobile" 
                      checked={featuredOnly}
                      onCheckedChange={(checked) => 
                        setFeaturedOnly(checked === true)
                      }
                    />
                    <label 
                      htmlFor="featured-mobile"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Featured Only
                    </label>
                  </div>
                  
                  {/* Tag Filters */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge 
                          key={tag}
                          variant={activeTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="secondary" onClick={clearAllFilters}>Clear All</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            {/* Desktop Filter Button */}
            <Button
              variant="outline"
              className="items-center gap-2 hidden md:flex"
              onClick={() => setOpenFilters(!openFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={featuredOnly ? "default" : "outline"}
              onClick={() => setFeaturedOnly(!featuredOnly)}
            >
              Featured
            </Button>
          </div>
        </div>
        
        {/* Expanded Filters - Desktop */}
        {openFilters && (
          <div className="hidden md:block border-t mt-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select 
                  value={selectedLocation || ""} 
                  onValueChange={val => setSelectedLocation(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Location</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Rating</label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                    <SelectItem value="2+">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={activeTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Info and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <p className="text-gray-600">
          Showing {currentBusinesses.length} of {filteredBusinesses.length} businesses
        </p>
        
        <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <span>Sort by</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <button 
                className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
                onClick={() => setSelectedCategory("")}
              >
                ×
              </button>
            </Badge>
          )}
          
          {selectedLocation && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Location: {selectedLocation}
              <button 
                className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
                onClick={() => setSelectedLocation(null)}
              >
                ×
              </button>
            </Badge>
          )}
          
          {selectedRating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rating: {selectedRating}
              <button 
                className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
                onClick={() => setSelectedRating("")}
              >
                ×
              </button>
            </Badge>
          )}
          
          {featuredOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Featured Only
              <button 
                className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
                onClick={() => setFeaturedOnly(false)}
              >
                ×
              </button>
            </Badge>
          )}
          
          {activeTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button 
                className="ml-1 h-4 w-4 rounded-full bg-gray-200 inline-flex items-center justify-center text-gray-500"
                onClick={() => toggleTag(tag)}
              >
                ×
              </button>
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}
      
      {/* Businesses Grid */}
      {currentBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentBusinesses.map(business => (
            <Card key={business.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={business.image} 
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {business.featured && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[70%] justify-end">
                  {business.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-xl text-gray-900 group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm ml-1">{business.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">({business.reviews})</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{business.category}</span>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{business.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1 shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-1 shrink-0" />
                  <span>{business.phone}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/business/${business.id}`}>View Details</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg mb-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default BusinessesPage;
