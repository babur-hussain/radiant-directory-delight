
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  selectedRating: string | null;
  selectedLocation: string | null;
  setSelectedRating: (rating: string | null) => void;
  setSelectedLocation: (location: string | null) => void;
  resetFilters: () => void;
}

const ActiveFilters = ({ 
  selectedRating, 
  selectedLocation, 
  setSelectedRating, 
  setSelectedLocation,
  resetFilters 
}: ActiveFiltersProps) => {
  if (!selectedRating && !selectedLocation) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <div className="text-sm text-gray-500">Active filters:</div>
      {selectedRating && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 text-xs rounded-full gap-1 flex items-center"
          onClick={() => setSelectedRating(null)}
        >
          {selectedRating} Stars
          <X className="h-3 w-3 ml-1" />
        </Button>
      )}
      {selectedLocation && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 text-xs rounded-full gap-1 flex items-center"
          onClick={() => setSelectedLocation(null)}
        >
          {selectedLocation}
          <X className="h-3 w-3 ml-1" />
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
  );
};

export default ActiveFilters;
