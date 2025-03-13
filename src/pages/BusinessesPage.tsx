
import { useState, useEffect, useMemo } from "react";
import { Search, Filter, MapPin, Star, Phone } from "lucide-react";
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

const BusinessesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [openFilters, setOpenFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  
  const itemsPerPage = 6;
  
  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(businessesData.map(b => b.category)));
  }, []);
  
  // Filter businesses based on search and filters
  const filteredBusinesses = useMemo(() => {
    return businessesData.filter(business => {
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
      
      return matchesSearch && matchesCategory && matchesRating && matchesFeatured;
    });
  }, [searchQuery, selectedCategory, selectedRating, featuredOnly]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const currentBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRating, featuredOnly]);
  
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
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setOpenFilters(!openFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <Button
              variant={featuredOnly ? "default" : "outline"}
              onClick={() => setFeaturedOnly(!featuredOnly)}
            >
              Featured
            </Button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {openFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
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
            
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSelectedCategory("");
                setSelectedRating("");
                setFeaturedOnly(false);
                setSearchQuery("");
              }}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Info */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {currentBusinesses.length} of {filteredBusinesses.length} businesses
        </p>
        
        <Select value="relevance" onValueChange={() => {}}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedRating("");
              setFeaturedOnly(false);
            }}
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
