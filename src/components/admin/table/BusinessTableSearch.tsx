
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessTableSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
  onAddBusiness?: () => void;
  isRefreshing?: boolean;
  startIndex?: number;
  endIndex?: number;
  totalBusinesses?: number;
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
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full mb-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search businesses..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {(onRefresh || onAddBusiness || totalBusinesses !== undefined) && (
        <div className="flex items-center gap-2 text-sm">
          {totalBusinesses !== undefined && startIndex !== undefined && endIndex !== undefined && (
            <span className="text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {totalBusinesses}
            </span>
          )}
          
          {onAddBusiness && (
            <Button variant="outline" size="sm" onClick={onAddBusiness}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
          
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessTableSearch;
