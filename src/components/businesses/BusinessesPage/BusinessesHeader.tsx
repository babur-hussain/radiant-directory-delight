
import React from "react";
import { Search, Filter } from "lucide-react";
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
import MobileFilters from "./MobileFilters";
import DesktopFilters from "./DesktopFilters";

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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // The search is already being applied as the user types,
      // so we don't need to do anything special on Enter
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-12">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            placeholder="Search businesses by name, description or tags..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="pl-10 text-gray-900"
            aria-label="Search businesses"
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

export default BusinessesHeader;
