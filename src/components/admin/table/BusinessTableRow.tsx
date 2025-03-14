
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Info, Pencil, Trash2 } from 'lucide-react';
import { Business } from '@/lib/csv-utils';
import { createGoogleSearchUrl } from '@/lib/utils';

interface BusinessTableRowProps {
  business: Business;
  onViewDetails: () => void;
  onEditBusiness: () => void;
  onDeleteBusiness: () => void;
}

const BusinessTableRow: React.FC<BusinessTableRowProps> = ({
  business,
  onViewDetails,
  onEditBusiness,
  onDeleteBusiness
}) => {
  // Determine if this is an original business (can't be edited or deleted)
  // Original businesses have IDs 1-20 in this demo
  const isOriginal = business.id <= 20;

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open Google search in a new tab
    window.open(createGoogleSearchUrl(business.name, business.address), '_blank');
    
    // Also call the original handler if needed
    onViewDetails();
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{business.id}</TableCell>
      <TableCell>{business.name}</TableCell>
      <TableCell>{business.category}</TableCell>
      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
        {business.address}
      </TableCell>
      <TableCell>{business.rating} ⭐</TableCell>
      <TableCell className="hidden md:table-cell">{business.phone}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handleViewDetails}>
            <Info className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            disabled={isOriginal}
            onClick={onEditBusiness}
            className={isOriginal ? "opacity-30 cursor-not-allowed" : ""}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isOriginal}
            className={isOriginal ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive/90 hover:bg-destructive/10"}
            onClick={onDeleteBusiness}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BusinessTableRow;
