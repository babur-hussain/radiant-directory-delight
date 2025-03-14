
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BusinessTableSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  onAddBusiness: () => void;
  isRefreshing: boolean;
  startIndex: number;
  endIndex: number;
  totalBusinesses: number;
}

const BusinessTableSearch: React.FC<BusinessTableSearchProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  onAddBusiness,
  isRefreshing,
  startIndex,
  endIndex,
  totalBusinesses
}) => {
  const isMobile = useIsMobile();
  
  const handleAddBusinessClick = () => {
    console.log("Add business button clicked in table search");
    onAddBusiness();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2 md:items-center mb-6">
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex-shrink-0 h-10 w-10"
          type="button"
          aria-label="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh data</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleAddBusinessClick}
          className="whitespace-nowrap"
          type="button"
        >
          <Plus className="h-4 w-4 mr-1" />
          {isMobile ? 'Add' : 'Add Business'}
        </Button>
        <div className="text-sm text-muted-foreground hidden md:block">
          Showing {startIndex + 1} to {endIndex} of {totalBusinesses} businesses
        </div>
      </div>
    </div>
  );
};

export default BusinessTableSearch;
