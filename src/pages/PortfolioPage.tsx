
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PortfolioCase, { CaseStudyStats } from '@/components/portfolio/PortfolioCase';

// Define types
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  industry: string;
  category: string;
  image: string;
  brandLogo?: string;
  stats: CaseStudyStats;
  tags: string[];
  featured: boolean;
}

// Sample portfolio data
const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Organic Beauty Brand Launch Campaign',
    description: 'Launch campaign for a new organic skincare line targeting eco-conscious millennials, featuring partnerships with sustainability influencers.',
    industry: 'Beauty & Personal Care',
    category: 'Product Launch',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=500&fit=crop',
    brandLogo: 'https://placehold.co/100x100',
    stats: {
      impressions: '2.8M',
      reach: '1.2M',
      engagement: '4.7%',
      conversionRate: '2.3%',
      salesIncrease: '185%'
    },
    tags: ['Beauty', 'Organic', 'Product Launch', 'Sustainability'],
    featured: true
  },
  {
    id: '2',
    title: 'Regional Food Chain Expansion',
    description: 'Helped a popular regional restaurant chain expand into new markets through strategic micro-influencer partnerships in target cities.',
    industry: 'Food & Beverage',
    category: 'Brand Awareness',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop',
    brandLogo: 'https://placehold.co/100x100',
    stats: {
      impressions: '1.5M',
      reach: '850K',
      engagement: '5.2%',
      footfallIncrease: '38%',
      roi: '320%'
    },
    tags: ['Food', 'Restaurants', 'Local Marketing', 'Micro-Influencers'],
    featured: true
  },
  {
    id: '3',
    title: 'Fitness App User Acquisition',
    description: 'Comprehensive campaign featuring fitness influencers to drive downloads and subscriptions for a new yoga and meditation app.',
    industry: 'Health & Wellness',
    category: 'User Acquisition',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=500&fit=crop',
    stats: {
      impressions: '3.2M',
      reach: '1.8M',
      engagement: '3.9%',
      downloads: '45K',
      subscriptionRate: '23%'
    },
    tags: ['Fitness', 'App Marketing', 'Wellness', 'Subscriptions'],
    featured: false
  },
  {
    id: '4',
    title: 'Traditional Handicrafts E-commerce Growth',
    description: 'Helped traditional artisans reach a global audience by connecting them with lifestyle and interior design influencers.',
    industry: 'Retail & E-commerce',
    category: 'Sales Growth',
    image: 'https://images.unsplash.com/photo-1606722590362-544aa8dc6a6a?w=800&h=500&fit=crop',
    stats: {
      impressions: '980K',
      reach: '520K',
      engagement: '4.5%',
      salesIncrease: '215%',
      internationalOrders: '45%'
    },
    tags: ['Handicrafts', 'E-commerce', 'Artisans', 'International'],
    featured: false
  },
  {
    id: '5',
    title: 'Sustainable Fashion Brand Awareness',
    description: 'Awareness campaign for a sustainable fashion brand through partnerships with environmental advocates and fashion influencers.',
    industry: 'Fashion',
    category: 'Brand Awareness',
    image: 'https://images.unsplash.com/photo-1588099768531-a72d4a198538?w=800&h=500&fit=crop',
    stats: {
      impressions: '4.1M',
      reach: '1.7M',
      engagement: '4.2%',
      brandLiftStudy: '38%',
      websiteTraffic: '245%'
    },
    tags: ['Fashion', 'Sustainability', 'Awareness', 'Eco-Friendly'],
    featured: false
  },
  {
    id: '6',
    title: 'Fintech App for Young Professionals',
    description: 'User acquisition campaign targeting young professionals for a new personal finance and investment app.',
    industry: 'Finance',
    category: 'User Acquisition',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
    stats: {
      impressions: '2.3M',
      reach: '1.1M',
      clickRate: '4.7%',
      costPerAcquisition: '₹280',
      roi: '375%'
    },
    tags: ['Fintech', 'Personal Finance', 'App Marketing', 'Millennials'],
    featured: false
  },
  {
    id: '7',
    title: 'Home Appliance Brand Relaunch',
    description: 'Comprehensive campaign to relaunch a heritage home appliance brand with a modern identity through home decor and lifestyle influencers.',
    industry: 'Home & Appliances',
    category: 'Brand Relaunch',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=500&fit=crop',
    stats: {
      impressions: '3.7M',
      reach: '2.1M',
      engagement: '3.5%',
      salesIncrease: '145%',
      brandSentiment: '+42%'
    },
    tags: ['Home Appliances', 'Rebranding', 'Lifestyle', 'Heritage Brand'],
    featured: true
  },
  {
    id: '8',
    title: 'Educational Toy Brand Awareness',
    description: 'Parent-targeted campaign featuring parenting influencers to promote an educational toy brand focused on STEM skills.',
    industry: 'Education & Toys',
    category: 'Brand Awareness',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=500&fit=crop',
    stats: {
      impressions: '1.9M',
      reach: '970K',
      engagement: '5.8%',
      websiteTraffic: '210%',
      salesIncrease: '178%'
    },
    tags: ['Education', 'Toys', 'Parenting', 'STEM'],
    featured: false
  }
];

const PortfolioPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Define categories from data
  const categories = ['all', ...new Set(portfolioItems.map(item => item.category))];
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter portfolio items based on search and active tab
  const filterItems = () => {
    let filtered = portfolioItems;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category/tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.category === activeTab);
    }
    
    return filtered;
  };

  const displayItems = filterItems();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="text-brand-orange">Portfolio</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our successful brand-influencer collaborations and campaigns that have delivered exceptional results.
          </p>
          
          <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="search"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <TabsList>
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Projects' : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {displayItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayItems.map(item => (
                  <PortfolioCase
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    industry={item.industry}
                    image={item.image}
                    brandLogo={item.brandLogo}
                    stats={item.stats}
                    tags={item.tags}
                    featured={item.featured}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found matching your search.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioPage;
