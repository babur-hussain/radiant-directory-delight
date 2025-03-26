
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Pencil, Trash } from 'lucide-react';
import { Business } from '@/lib/csv-utils';

interface BusinessTableRowProps {
  business: Business;
  onViewDetails?: (business: Business) => void;
  onEditBusiness: (business: Business) => void;
  onDeleteBusiness: (business: Business) => void; // Required prop
  index?: number;
}

const BusinessTableRow: React.FC<BusinessTableRowProps> = ({
  business,
  onViewDetails,
  onEditBusiness,
  onDeleteBusiness,
  index
}) => {
  // Convert id to number for comparison, safely handle string ids
  const businessId = typeof business.id === 'string' ? 
    parseInt(business.id, 10) : business.id;
  
  // Only check if businessId is a valid number before comparing
  const isNewBusiness = typeof businessId === 'number' && !isNaN(businessId) ? businessId <= 0 : false;

  return (
    <TableRow>
      <TableCell className="font-medium">{business.name}</TableCell>
      <TableCell>
        {business.category && (
          <Badge variant="outline" className="capitalize">
            {business.category}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span>{business.rating}</span>
          <span className="text-gray-500 text-xs ml-1">({business.reviews})</span>
        </div>
      </TableCell>
      <TableCell>
        {business.featured ? (
          <Badge className="bg-primary hover:bg-primary">Featured</Badge>
        ) : (
          <Badge variant="outline">Standard</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex justify-end space-x-2">
          {onViewDetails && (
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(business)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEditBusiness(business)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDeleteBusiness(business)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BusinessTableRow;
