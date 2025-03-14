
import { Button } from '@/components/ui/button';
import BusinessCard from './BusinessCard';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/csv-utils';

interface BusinessGridProps {
  businesses: Business[];
  resetFilters: () => void;
  loading?: boolean;
}

const BusinessGrid = ({ businesses, resetFilters, loading = false }: BusinessGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Loading businesses...</span>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {businesses.length > 0 ? (
          businesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or view all businesses</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        )}
      </div>
      
      {/* View More Button */}
      <div className="mt-12 text-center">
        <Button
          variant="outline"
          className="rounded-full transition-smooth"
          asChild
        >
          <Link to="/businesses">View All Businesses</Link>
        </Button>
      </div>
    </>
  );
};

export default BusinessGrid;
