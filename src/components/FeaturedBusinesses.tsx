
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { businessesData } from '@/data/businessesData';

// Get the first 6 businesses to display
const featuredBusinesses = businessesData.filter(b => b.featured).slice(0, 6);

const BusinessCard = ({ business }: { business: typeof businessesData[0] }) => {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-smooth">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {business.featured && (
          <span className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
            Featured
          </span>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {business.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index} 
              className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-smooth">
            {business.name}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-700 ml-1">{business.rating}</span>
            <span className="text-xs text-gray-400 ml-1">({business.reviews})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{business.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{business.address}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{business.phone}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">{business.category}</span>
        <Link 
          to={`/businesses?category=${encodeURIComponent(business.category)}`}
          className="flex items-center text-xs font-medium text-primary hover:text-primary/90 transition-smooth"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  );
};

const FeaturedBusinesses = () => {
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(featuredBusinesses.map(b => b.category)));
  
  const filteredBusinesses = visibleCategory
    ? featuredBusinesses.filter(b => b.category === visibleCategory)
    : featuredBusinesses;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Businesses</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Discover top-rated local businesses that consistently deliver exceptional service.
          </p>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Button
            variant={visibleCategory === null ? "default" : "outline"}
            className="rounded-full text-sm transition-smooth"
            onClick={() => setVisibleCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={visibleCategory === category ? "default" : "outline"}
              className="rounded-full text-sm transition-smooth"
              onClick={() => setVisibleCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Businesses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
        
        {/* View More Button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="rounded-full transition-smooth"
            asChild
          >
            <Link to="/businesses">View More Businesses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
