import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CollaborationCard from './CollaborationCard';

const featuredCollaborations = [
  {
    title: 'Organic Skincare Launch Campaign',
    description: 'A successful collaboration between EcoGlow Skincare and beauty influencer Ananya to launch a new organic skincare line.',
    brandName: 'EcoGlow Skincare',
    brandLogo: 'https://placehold.co/100x100',
    influencerName: 'Ananya',
    influencerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: 'April 2023',
    category: 'Product Launch',
    tags: ['Beauty', 'Organic', 'Skincare'],
    coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=300&fit=crop',
    stats: {
      reach: '1.2M',
      engagement: '4.8%',
      conversions: '3.2%'
    }
  },
  {
    title: 'Fitness App User Acquisition',
    description: 'Partnership between FitLife App and fitness influencer Rahul Singh to drive downloads and subscriptions.',
    brandName: 'FitLife App',
    brandLogo: 'https://placehold.co/100x100',
    influencerName: 'Rahul Singh',
    influencerImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
    date: 'June 2023',
    category: 'User Acquisition',
    tags: ['Fitness', 'App', 'Health'],
    coverImage: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=300&fit=crop',
    stats: {
      reach: '850K',
      engagement: '5.2%',
      conversions: '4.7%'
    }
  },
  {
    title: 'Traditional Handicrafts E-commerce',
    description: 'Helping artisans reach global audiences through partnerships with home decor influencers.',
    brandName: 'ArtisanCraft',
    brandLogo: 'https://placehold.co/100x100',
    influencerName: 'Priya Sharma',
    influencerImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    date: 'August 2023',
    category: 'E-commerce',
    tags: ['Handicrafts', 'Artisans', 'Home Decor'],
    coverImage: 'https://placehold.co/600x300?text=Handicrafts',
    stats: {
      reach: '750K',
      engagement: '4.3%',
      conversions: '3.5%'
    }
  }
];

const CollaborationsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Successful <span className="text-brand-orange">Collaborations</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our recent brand-influencer partnerships that have delivered exceptional results and created authentic connections with audiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollaborations.map((collab, index) => (
            <CollaborationCard key={index} {...collab} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/portfolio">
            <Button className="bg-brand-orange text-white hover:bg-brand-orange/90">
              Explore Our Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollaborationsSection;
