
import React from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { Button } from '@/components/ui/button';

const featuredBlogs = [
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
    id: '3',
    title: '5 Tips for Influencers to Negotiate Better Brand Deals',
    excerpt: 'Expert advice for influencers on how to negotiate better compensation, more favorable terms, and build long-term partnerships with brands.',
    image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'July 10, 2023',
    category: 'Tips for Influencers',
    author: 'Amit Singh',
    tags: ['Negotiation', 'Partnerships', 'Income']
  }
];

const BlogSection = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Latest <span className="text-brand-orange">Insights</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, success stories, and expert advice in the world of influencer marketing and brand collaborations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBlogs.map(blog => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/blog">
            <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
