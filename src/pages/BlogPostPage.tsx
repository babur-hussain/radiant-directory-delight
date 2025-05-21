
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ArrowLeft, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BlogCard from '@/components/blog/BlogCard';

// Sample blog data - would come from an API in a real application
const blogPosts = [
  {
    id: '1',
    title: 'How to Build a Successful Influencer Marketing Strategy in 2023',
    excerpt: 'Learn the latest strategies and tactics for creating effective influencer marketing campaigns that drive real results for your business.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&h=800&auto=format&fit=crop',
    date: 'May 15, 2023',
    category: 'Influencer Marketing Trends',
    author: 'Rahul Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop',
    tags: ['Strategy', 'Marketing', 'Growth'],
    content: `
      <p class="mb-4">Influencer marketing has become a cornerstone of modern digital marketing strategies, with brands of all sizes leveraging influencer partnerships to reach new audiences and build authentic connections.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Understanding Your Audience</h2>
      <p class="mb-4">The first step in any influencer marketing strategy is to thoroughly understand your target audience. This includes demographic information, interests, pain points, and most importantly - which influencers they follow and trust.</p>
      <p class="mb-4">Conduct surveys, analyze social media insights, and review competitor campaigns to gather this essential data.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Setting Clear Objectives</h2>
      <p class="mb-4">Like any marketing initiative, your influencer campaigns need clear, measurable objectives. Are you looking to:</p>
      <ul class="list-disc pl-8 mb-4">
        <li>Increase brand awareness</li>
        <li>Drive traffic to your website</li>
        <li>Generate leads or sales</li>
        <li>Launch a new product or service</li>
        <li>Reach a new audience segment</li>
      </ul>
      <p class="mb-4">Each objective requires different types of influencers, content, and measurement criteria.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Finding the Right Influencers</h2>
      <p class="mb-4">The success of your campaign hinges on partnering with influencers who align with your brand values and can authentically connect with your target audience.</p>
      <p class="mb-4">When evaluating potential partners, look beyond follower counts and consider:</p>
      <ul class="list-disc pl-8 mb-4">
        <li>Engagement rates (likes, comments, shares)</li>
        <li>Content quality and style</li>
        <li>Audience demographics and interests</li>
        <li>Previous brand collaborations</li>
        <li>Values and brand alignment</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Crafting Compelling Campaigns</h2>
      <p class="mb-4">The most effective influencer campaigns provide creative freedom within clear guidelines. Overly scripted content often feels inauthentic and can alienate the influencer's audience.</p>
      <p class="mb-4">Work collaboratively with your influencers to develop content that:</p>
      <ul class="list-disc pl-8 mb-4">
        <li>Feels natural and authentic to their personal brand</li>
        <li>Clearly communicates your key messages</li>
        <li>Provides genuine value to the audience</li>
        <li>Includes clear calls-to-action</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Measuring Success</h2>
      <p class="mb-4">Establish KPIs that align with your objectives and track them consistently. Common metrics include:</p>
      <ul class="list-disc pl-8 mb-4">
        <li>Engagement (likes, comments, shares)</li>
        <li>Reach and impressions</li>
        <li>Website traffic from influencer links</li>
        <li>Conversions and sales</li>
        <li>Brand sentiment and mentions</li>
      </ul>
      <p class="mb-4">Use UTM parameters, custom discount codes, or dedicated landing pages to accurately track the performance of each influencer and campaign.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Building Long-Term Relationships</h2>
      <p class="mb-4">While one-off campaigns can be effective, long-term influencer partnerships often deliver greater value and authenticity. Consider ambassador programs or ongoing collaborations with your best-performing influencers.</p>
      <p class="mb-4">This approach allows influencers to develop deeper knowledge of your brand and products, resulting in more credible recommendations and stronger audience trust.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Influencer marketing continues to evolve, but its core principle remains constant: authentic connections drive results. By focusing on alignment, authenticity, and mutual value, your influencer marketing strategy can deliver exceptional returns for your brand.</p>
    `
  },
  // Additional blog posts would be defined here...
];

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);
  
  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/blog" className="text-brand-orange hover:underline mt-4 inline-block">
          Return to blog
        </Link>
      </div>
    );
  }
  
  // Related posts (in a real app, would be filtered based on tags/category)
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center text-brand-orange hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to all articles
          </Link>
        </div>
        
        <article className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Badge variant="secondary" className="hover:bg-brand-orange/20">{post.category}</Badge>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {post.date}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
            
            <div className="flex items-center mb-8">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.authorAvatar} alt={post.author} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-sm text-gray-500">Content Writer</p>
              </div>
            </div>
            
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            <div className="flex gap-2 mt-8">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <Separator className="my-8" />
            
            <div>
              <h3 className="font-medium mb-4">Share this article</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>
        
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(post => (
                <BlogCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
