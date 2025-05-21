
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';

// Sample blog data - in a real application this would come from an API
const blogPosts = [
  // Influencer Marketing Trends
  {
    id: '1',
    title: 'How to Build a Successful Influencer Marketing Strategy in 2023',
    excerpt: 'Learn the latest strategies and tactics for creating effective influencer marketing campaigns that drive real results for your business.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'May 15, 2023',
    category: 'Influencer Marketing Trends',
    author: 'Rahul Sharma',
    tags: ['Strategy', 'Marketing', 'Growth']
  },
  {
    id: '4',
    title: 'Emerging Influencer Platforms You Should Know About',
    excerpt: 'Beyond Instagram and TikTok, these emerging platforms are creating new opportunities for influencer-brand collaborations.',
    image: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'August 5, 2023',
    category: 'Influencer Marketing Trends',
    author: 'Kavita Joshi',
    tags: ['Platforms', 'Trends', 'Opportunities']
  },
  
  // Campaign Success Stories
  {
    id: '2',
    title: 'Case Study: How Brand X Increased Sales by 200% with Influencer Marketing',
    excerpt: 'An in-depth look at how Brand X leveraged the right influencer partnerships to dramatically increase their product sales and brand awareness.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'June 2, 2023',
    category: 'Campaign Success Stories',
    author: 'Priya Patel',
    tags: ['Case Study', 'ROI', 'Success Story']
  },
  {
    id: '5',
    title: 'Local Store Reaches National Audience Through Micro-Influencers',
    excerpt: 'How a small local business leveraged micro-influencers to expand their reach and establish a national presence.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'September 12, 2023',
    category: 'Campaign Success Stories',
    author: 'Sanjay Kapoor',
    tags: ['Micro-Influencers', 'Small Business', 'Growth']
  },
  
  // Tips for Brands and Influencers
  {
    id: '3',
    title: '5 Tips for Influencers to Negotiate Better Brand Deals',
    excerpt: 'Expert advice for influencers on how to negotiate better compensation, more favorable terms, and build long-term partnerships with brands.',
    image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'July 10, 2023',
    category: 'Tips for Brands and Influencers',
    author: 'Amit Singh',
    tags: ['Negotiation', 'Partnerships', 'Income']
  },
  {
    id: '6',
    title: 'Building an Authentic Brand-Influencer Relationship',
    excerpt: 'Learn how to create authentic partnerships between brands and influencers that resonate with audiences and deliver lasting results.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'October 8, 2023',
    category: 'Tips for Brands and Influencers',
    author: 'Neha Gupta',
    tags: ['Authenticity', 'Relationships', 'Strategy']
  }
];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filterPosts = () => {
    let filteredPosts = blogPosts;
    
    // Filter by search term
    if (searchTerm) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category/tab
    if (activeTab !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === activeTab);
    }
    
    return filteredPosts;
  };

  const displayPosts = filterPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="text-brand-orange">Blog</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Insights, trends, and success stories from the world of influencer marketing and brand collaborations.
          </p>
          
          <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="search"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="Influencer Marketing Trends">Marketing Trends</TabsTrigger>
              <TabsTrigger value="Campaign Success Stories">Success Stories</TabsTrigger>
              <TabsTrigger value="Tips for Brands and Influencers">Tips & Advice</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {displayPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPosts.map(post => (
                  <BlogCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found matching your search.</p>
              </div>
            )}
          </TabsContent>
          
          {['Influencer Marketing Trends', 'Campaign Success Stories', 'Tips for Brands and Influencers'].map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              {displayPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayPosts.map(post => (
                    <BlogCard key={post.id} {...post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts found matching your search.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default BlogPage;
