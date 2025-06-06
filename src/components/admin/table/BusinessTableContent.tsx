
import React from 'react';
import { Business } from '@/lib/csv-utils';
import BusinessTable from './BusinessTable';
import TablePagination from './TablePagination';

interface BusinessTableContentProps {
  businesses: Business[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  onViewDetails: (business: Business) => void;
  onEditBusiness: (business: Business) => void;
  onDeleteBusiness: (business: Business) => void;
}

const BusinessTableContent: React.FC<BusinessTableContentProps> = ({
  businesses,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  onViewDetails,
  onEditBusiness,
  onDeleteBusiness
}) => {
  // Calculate pagination values
  const totalPages = Math.ceil(businesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, businesses.length);
  const currentBusinesses = businesses.slice(startIndex, endIndex);

  console.log('BusinessTableContent rendering', { 
    totalBusinesses: businesses.length,
    currentBusinessesCount: currentBusinesses.length,
    startIndex,
    endIndex
  });

  return (
    <div className="space-y-4">
      <BusinessTable 
        businesses={currentBusinesses}
        onViewDetails={onViewDetails}
        onEditBusiness={onEditBusiness}
        onDeleteBusiness={onDeleteBusiness}
      />
      
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default BusinessTableContent;
