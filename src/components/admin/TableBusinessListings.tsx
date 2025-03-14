
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Search, Info, RefreshCw } from 'lucide-react';
import { getAllBusinesses, addDataChangeListener, removeDataChangeListener } from '@/lib/csv-utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import BusinessImage from '@/components/BusinessImage';

interface TableBusinessListingsProps {
  onRefresh?: () => void;
}

export const TableBusinessListings: React.FC<TableBusinessListingsProps> = ({ onRefresh }) => {
  const [businesses, setBusinesses] = useState(getAllBusinesses());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 100;
  
  // Handle data changes and refreshes
  const refreshData = () => {
    setIsRefreshing(true);
    // Get the latest data
    setBusinesses(getAllBusinesses());
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "The business listings have been updated.",
      });
    }, 500); // small delay for visual feedback
    
    // Notify parent component if needed
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Listen for data changes
  useEffect(() => {
    // Initial data load
    refreshData();
    
    // Add a listener for data changes
    addDataChangeListener(refreshData);
    
    // Cleanup on unmount
    return () => {
      removeDataChangeListener(refreshData);
    };
  }, []);
  
  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBusinesses.length);
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageItems = 5; // Maximum number of page items to show
    
    if (totalPages <= maxPageItems) {
      // Show all pages if total pages are less than or equal to maxPageItems
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of the middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to ensure we show at least 3 middle pages when possible
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 3, 2);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 md:items-center mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh data</span>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {endIndex} of {filteredBusinesses.length} businesses
        </div>
      </div>
      
      {/* Table */}
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
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBusinesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No businesses found.
                </TableCell>
              </TableRow>
            ) : (
              currentBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.id}</TableCell>
                  <TableCell>{business.name}</TableCell>
                  <TableCell>{business.category}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {business.address}
                  </TableCell>
                  <TableCell>{business.rating} ⭐</TableCell>
                  <TableCell className="hidden md:table-cell">{business.phone}</TableCell>
                  <TableCell className="text-right">
                    <Dialog onOpenChange={(open) => {
                      if (open) setSelectedBusiness(business);
                      else setSelectedBusiness(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{business.name}</DialogTitle>
                          <DialogDescription>Business Details</DialogDescription>
                        </DialogHeader>
                        {selectedBusiness && (
                          <div className="space-y-4">
                            <div className="aspect-video overflow-hidden rounded-md">
                              <BusinessImage 
                                src={selectedBusiness.image} 
                                alt={selectedBusiness.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Category</p>
                                <p className="text-sm">{selectedBusiness.category}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Rating</p>
                                <p className="text-sm">{selectedBusiness.rating} ⭐ ({selectedBusiness.reviews} reviews)</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm">{selectedBusiness.address}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm">{selectedBusiness.phone}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Description</p>
                                <p className="text-sm">{selectedBusiness.description}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Tags</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedBusiness.tags.map((tag: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                  <PaginationLink className="cursor-default">...</PaginationLink>
                ) : (
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    className={typeof page === 'number' ? "cursor-pointer" : ""}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
