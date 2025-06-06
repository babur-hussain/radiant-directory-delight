
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Business } from '@/lib/csv-utils';
import BusinessTableRow from './BusinessTableRow';
import { Info } from 'lucide-react';

interface BusinessTableProps {
  businesses: Business[];
  onViewDetails: (business: Business) => void;
  onEditBusiness: (business: Business) => void;
  onDeleteBusiness: (business: Business) => void;
}

const BusinessTable: React.FC<BusinessTableProps> = ({
  businesses,
  onViewDetails,
  onEditBusiness,
  onDeleteBusiness
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!businesses || businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No businesses found.
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <BusinessTableRow 
                key={business.id}
                business={business}
                onViewDetails={() => onViewDetails(business)}
                onEditBusiness={() => onEditBusiness(business)}
                onDeleteBusiness={() => onDeleteBusiness(business)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessTable;
