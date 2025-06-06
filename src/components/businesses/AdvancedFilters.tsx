
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Filter, X, Check } from 'lucide-react';

interface AdvancedFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedRating: string | null;
  setSelectedRating: (rating: string | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  locations: string[];
  hasActiveFilters: boolean;
}

const AdvancedFilters = ({
  showFilters,
  setShowFilters,
  selectedRating,
  setSelectedRating,
  selectedLocation,
  setSelectedLocation,
  locations,
  hasActiveFilters
}: AdvancedFiltersProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)} 
          className="rounded-full ml-2 flex items-center gap-1"
        >
          <Filter className="h-4 w-4 mr-1" />
          More Filters 
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-primary ml-1"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Rating Filter */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">Rating</DropdownMenuLabel>
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onClick={() => setSelectedRating(null)}
        >
          Any Rating
          {!selectedRating && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onClick={() => setSelectedRating("4+")}
        >
          4+ Stars
          {selectedRating === "4+" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onClick={() => setSelectedRating("3+")}
        >
          3+ Stars
          {selectedRating === "3+" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Location Filter */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">Location</DropdownMenuLabel>
        <div className="max-h-40 overflow-y-auto py-1">
          <DropdownMenuItem 
            className="flex items-center justify-between"
            onClick={() => setSelectedLocation(null)}
          >
            Any Location
            {!selectedLocation && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          
          {locations.map(location => (
            <DropdownMenuItem
              key={location}
              className="flex items-center justify-between"
              onClick={() => setSelectedLocation(location)}
            >
              {location}
              {selectedLocation === location && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </div>
        
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center justify-center text-destructive"
              onClick={() => {
                setSelectedRating(null);
                setSelectedLocation(null);
              }}
            >
              <X className="h-4 w-4 mr-1" /> Clear All Filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdvancedFilters;
