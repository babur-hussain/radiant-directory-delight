
import { Button } from '@/components/ui/button';
import BusinessCard from './BusinessCard';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/csv/types';
import Loading from '@/components/ui/loading';
import { useIsMobile } from '@/hooks/use-mobile';

interface BusinessGridProps {
  businesses: Business[];
  resetFilters: () => void;
  loading?: boolean;
}

const BusinessGrid = ({ businesses, resetFilters, loading = false }: BusinessGridProps) => {
  const isMobile = useIsMobile();
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-10 sm:py-20">
        <Loading size="lg" message="Loading businesses..." />
      </div>
    );
  }
  
  if (businesses.length === 0) {
    return (
      <div className="col-span-full text-center py-8 sm:py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
        <Button onClick={resetFilters}>Reset Filters</Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
        {businesses.map(business => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
      
      {/* View More Button */}
      <div className="mt-8 sm:mt-12 text-center">
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
