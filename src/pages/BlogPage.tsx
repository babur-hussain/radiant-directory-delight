
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample blog data
const blogPosts = [
  {
    id: '1',
    title: 'Top 10 Tips for Successful Influencer Marketing',
    description: 'Learn the key strategies for running successful influencer marketing campaigns.',
    date: 'May 15, 2023',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=1200&h=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'How to Choose the Right Influencers for Your Brand',
    description: 'Finding the perfect match between influencers and your brand identity.',
    date: 'April 22, 2023',
    category: 'Strategy',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&h=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Measuring ROI in Influencer Marketing Campaigns',
    description: 'Effective methods to track and analyze the return on investment from your campaigns.',
    date: 'March 10, 2023',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=800&auto=format&fit=crop',
  },
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="text-brand-orange">Blog</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and strategies to help you succeed in the world of influencer marketing.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{post.date}</span>
                  <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                    {post.category}
                  </span>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="text-primary hover:underline text-sm font-medium">
                  Read more →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
