
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Star } from 'lucide-react';

const GoogleRankInfo: React.FC = () => {
  const rankingAchievements = [
    {
      title: 'Top 3 Search Results',
      description: 'For 80+ target keywords related to influencer marketing in India',
      icon: TrendingUp
    },
    {
      title: 'Featured Snippets',
      description: 'Achieved featured snippet positions for 15+ high-value search terms',
      icon: Award
    },
    {
      title: 'Local SEO Excellence',
      description: 'Ranking #1 in local search for "influencer marketing services" in 12 major Indian cities',
      icon: Star
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Our SEO <span className="text-brand-orange">Achievements</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We don't just help our clients achieve great visibility - we practice what we preach. Our platform consistently ranks at the top of search results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rankingAchievements.map((achievement, index) => (
            <Card key={index} className="border-2 hover:border-brand-orange/20 transition-all">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gradient-orange-yellow w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <achievement.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                {achievement.description}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 bg-gray-50 p-8 rounded-lg max-w-4xl mx-auto shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-center">How We Achieve Top Rankings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">Comprehensive Keyword Research</h4>
              <p className="text-gray-600">
                We identify the exact search terms your target audience uses, focusing not just on volume but on search intent and conversion potential.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Content Optimization</h4>
              <p className="text-gray-600">
                Our content is strategically crafted to satisfy both search engines and human readers, with clear structures, valuable information, and relevant keywords.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Technical SEO Excellence</h4>
              <p className="text-gray-600">
                We ensure your website's technical foundation is solid, with fast loading times, mobile optimization, and clean code that search engines can easily crawl.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Authority Building</h4>
              <p className="text-gray-600">
                Through strategic partnerships and content marketing, we help establish your brand as an authority in your niche, earning valuable backlinks naturally.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row p-6 bg-white rounded-lg shadow-sm items-center">
            <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
              <img 
                src="https://placehold.co/200x100" 
                alt="Google Certified Partner" 
                className="h-20 object-contain"
              />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Google Certified Partner</h4>
              <p className="text-gray-600 text-sm">
                As a Google Certified Partner, we follow industry best practices and have demonstrated expertise in digital marketing, SEO, and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleRankInfo;
