
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sample business data
const businesses = [
  {
    id: 1,
    name: 'Skyline Restaurant',
    category: 'Restaurants',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.8,
    reviews: 243,
    address: '123 Main St, New York, NY',
    phone: '(212) 555-1234',
    description: 'Upscale dining with panoramic city views and world-class cuisine.',
    featured: true,
    tags: ['Fine Dining', 'American', 'Cocktails']
  },
  {
    id: 2,
    name: 'Luxe Hotel & Spa',
    category: 'Hotels',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.9,
    reviews: 512,
    address: '500 Fifth Ave, New York, NY',
    phone: '(212) 555-5678',
    description: 'Five-star luxury hotel with premium amenities and exceptional service.',
    featured: true,
    tags: ['Luxury', 'Spa', 'Restaurant']
  },
  {
    id: 3,
    name: 'Urban Styles',
    category: 'Shopping',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.6,
    reviews: 187,
    address: '890 Broadway, New York, NY',
    phone: '(212) 555-9012',
    description: 'Contemporary fashion boutique featuring designer brands and unique pieces.',
    featured: true,
    tags: ['Fashion', 'Accessories', 'Boutique']
  },
  {
    id: 4,
    name: 'Wellness Medical Center',
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.7,
    reviews: 326,
    address: '425 Park Ave, New York, NY',
    phone: '(212) 555-3456',
    description: 'Comprehensive healthcare services with a focus on preventative medicine.',
    featured: true,
    tags: ['Medical', 'Family Practice', 'Specialists']
  },
  {
    id: 5,
    name: 'Elite Learning Academy',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.5,
    reviews: 198,
    address: '220 W 42nd St, New York, NY',
    phone: '(212) 555-7890',
    description: 'Premier educational institution with innovative teaching methods.',
    featured: true,
    tags: ['Private School', 'K-12', 'After School']
  },
  {
    id: 6,
    name: 'Precision Auto Care',
    category: 'Automotive',
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=500&h=350&auto=format&fit=crop',
    rating: 4.4,
    reviews: 156,
    address: '785 8th Ave, New York, NY',
    phone: '(212) 555-2345',
    description: 'Expert auto repair and maintenance services with certified technicians.',
    featured: true,
    tags: ['Auto Repair', 'Maintenance', 'Diagnostics']
  }
];

const BusinessCard = ({ business }: { business: typeof businesses[0] }) => {
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
          to={`/business/${business.id}`}
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
  
  const categories = Array.from(new Set(businesses.map(b => b.category)));
  
  const filteredBusinesses = visibleCategory
    ? businesses.filter(b => b.category === visibleCategory)
    : businesses;

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
            onClick={() => console.log('View more businesses')}
          >
            View More Businesses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
