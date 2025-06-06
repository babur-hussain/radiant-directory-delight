
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type SortOption = "relevance" | "rating" | "reviews";

interface BusinessesSortingProps {
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  filteredCount: number;
  totalCount: number;
}

const BusinessesSorting: React.FC<BusinessesSortingProps> = ({
  sortBy,
  setSortBy,
  filteredCount,
  totalCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <p className="text-gray-600">
        Showing {filteredCount} of {totalCount} businesses
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
  );
};

export default BusinessesSorting;
