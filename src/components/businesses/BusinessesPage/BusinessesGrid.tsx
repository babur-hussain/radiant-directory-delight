
import React from "react";
import BusinessCard from "@/components/businesses/BusinessCard";
import { Business } from "@/lib/csv/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BusinessesGridProps {
  businesses: Business[];
  clearAllFilters: () => void;
  isSearching?: boolean;
}

const BusinessesGrid: React.FC<BusinessesGridProps> = ({ 
  businesses, 
  clearAllFilters,
  isSearching = false
}) => {
  const isMobile = useIsMobile();
  
  if (isSearching) {
    return (
      <div className="flex flex-col justify-center items-center py-10 sm:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <span className="text-lg text-gray-600">Searching businesses...</span>
      </div>
    );
  }
  
  if (businesses.length === 0) {
    return (
      <div className="text-center py-10 sm:py-20">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">No businesses found</h3>
        <p className="text-gray-500 mb-5 sm:mb-6 max-w-md mx-auto">
          We couldn't find any businesses matching your search criteria.
        </p>
        <Button onClick={clearAllFilters}>
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
};

export default BusinessesGrid;
