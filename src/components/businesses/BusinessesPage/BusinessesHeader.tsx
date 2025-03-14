
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface BusinessesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilterCount: number;
  setOpenFilters: (open: boolean) => void;
  openFilters: boolean;
  featuredOnly: boolean;
  setFeaturedOnly: (featured: boolean) => void;
  clearAllFilters: () => void;
  allTags: string[];
  activeTags: string[];
  toggleTag: (tag: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  locations: string[];
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
}

const BusinessesHeader: React.FC<BusinessesHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  setOpenFilters,
  openFilters,
  featuredOnly,
  setFeaturedOnly,
  clearAllFilters,
  allTags,
  activeTags,
  toggleTag,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  locations,
  selectedRating,
  setSelectedRating
}) => {
  return (
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
              <MobileFilters 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                locations={locations}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                featuredOnly={featuredOnly}
                setFeaturedOnly={setFeaturedOnly}
              />
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
      
      <div className="hidden md:block border-t mt-4 pt-4">
        <DesktopFilters 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          clearAllFilters={clearAllFilters}
        />
      </div>
    </div>
  );
};

interface FiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  locations: string[];
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
}

interface MobileFiltersProps extends FiltersProps {
  featuredOnly: boolean;
  setFeaturedOnly: (featured: boolean) => void;
}

interface DesktopFiltersProps extends FiltersProps {
  clearAllFilters: () => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  locations,
  selectedRating,
  setSelectedRating,
  featuredOnly,
  setFeaturedOnly
}) => {
  // Get categories from localStorage or use empty array
  const categories = React.useMemo(() => {
    const storedCategories = localStorage.getItem("businessCategories");
    if (storedCategories) {
      return JSON.parse(storedCategories).map((cat: { name: string }) => cat.name);
    }
    return [];
  }, []);

  return (
    <div className="py-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Category</h3>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Location</h3>
        <select 
          value={selectedLocation || ""} 
          onChange={(e) => setSelectedLocation(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Any Location</option>
          {locations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Rating</h3>
        <select 
          value={selectedRating} 
          onChange={(e) => setSelectedRating(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Any Rating</option>
          <option value="4+">4+ Stars</option>
          <option value="3+">3+ Stars</option>
          <option value="2+">2+ Stars</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="featured-mobile" 
          checked={featuredOnly}
          onChange={(e) => setFeaturedOnly(e.target.checked)}
        />
        <label 
          htmlFor="featured-mobile"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Featured Only
        </label>
      </div>
    </div>
  );
};

const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  locations,
  selectedRating,
  setSelectedRating,
  clearAllFilters
}) => {
  // Get categories from localStorage or use empty array
  const categories = React.useMemo(() => {
    const storedCategories = localStorage.getItem("businessCategories");
    if (storedCategories) {
      return JSON.parse(storedCategories).map((cat: { name: string }) => cat.name);
    }
    return [];
  }, []);
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Location</label>
          <select 
            value={selectedLocation || ""} 
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            className="w-full p-2 border rounded"
          >
            <option value="">Any Location</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Rating</label>
          <select 
            value={selectedRating} 
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Any Rating</option>
            <option value="4+">4+ Stars</option>
            <option value="3+">3+ Stars</option>
            <option value="2+">2+ Stars</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>
    </>
  );
};

export default BusinessesHeader;
