
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="rounded-full ml-2">
          More Filters {hasActiveFilters && '•'}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdvancedFilters;
