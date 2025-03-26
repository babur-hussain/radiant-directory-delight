
import { Button } from '@/components/ui/button';
import BusinessCard from './BusinessCard';
import { Link } from 'react-router-dom';
import { Business as CsvBusiness } from '@/lib/csv-utils';
import { Business } from '@/types/business';
import Loading from '@/components/ui/loading';

// Create a type that works with both Business types
type BusinessProps = {
  businesses: (Business | CsvBusiness)[];
  resetFilters: () => void;
  loading?: boolean;
}

const BusinessGrid = ({ businesses, resetFilters, loading = false }: BusinessProps) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loading size="lg" message="Loading businesses..." />
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {businesses.length > 0 ? (
          businesses.map(business => (
            <BusinessCard key={business.id} business={business as Business} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or add businesses through the admin dashboard</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        )}
      </div>
      
      {/* View More Button */}
      {businesses.length > 0 && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="rounded-full transition-smooth"
            asChild
          >
            <Link to="/businesses">View All Businesses</Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default BusinessGrid;
