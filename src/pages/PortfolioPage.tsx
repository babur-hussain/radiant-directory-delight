
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const portfolioCases = [
  {
    id: '1',
    title: 'Restaurant Chain Growth Campaign',
    description: 'Helped a national restaurant chain increase foot traffic by 35% through strategic influencer partnerships.',
    category: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&h=800&auto=format&fit=crop',
    tags: ['Restaurants', 'Local Marketing', 'Influencer Collaboration']
  },
  {
    id: '2',
    title: 'Fashion Brand Launch',
    description: 'Orchestrated a successful market entry for a new sustainable fashion brand through targeted influencer campaigns.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&h=800&auto=format&fit=crop',
    tags: ['Product Launch', 'Fashion', 'Sustainability']
  },
  {
    id: '3',
    title: 'Tech Gadget Awareness Campaign',
    description: 'Boosted product awareness and sales for a new tech gadget through specialized tech influencer partnerships.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&h=800&auto=format&fit=crop',
    tags: ['Technology', 'Product Marketing', 'Gadgets']
  }
];

const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="text-brand-orange">Portfolio</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore some of our successful projects and case studies showcasing our expertise in connecting businesses with the right influencers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioCases.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <Badge className="mb-3">{item.category}</Badge>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
