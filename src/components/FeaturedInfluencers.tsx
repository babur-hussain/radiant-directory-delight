
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, TrendingUp, Instagram, Youtube, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Influencer } from '@/lib/csv/influencerTypes';

const FeaturedInfluencers: React.FC = () => {
  const [featuredInfluencers, setFeaturedInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedInfluencers();
  }, []);

  const fetchFeaturedInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('featured', true)
        .order('priority', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured influencers:', error);
        return;
      }

      setFeaturedInfluencers(data || []);
    } catch (error) {
      console.error('Error fetching featured influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Influencers</h2>
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredInfluencers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Influencers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our top-rated influencers who are ready to help grow your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredInfluencers.map((influencer) => (
            <Card key={influencer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative">
                {influencer.cover_image && (
                  <img
                    src={influencer.cover_image}
                    alt={`${influencer.name}'s cover`}
                    className="w-full h-full object-cover"
                  />
                )}
                <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden -mt-10 relative z-10">
                  <img
                    src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=80`}
                    alt={influencer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <CardHeader className="text-center pt-2 pb-4">
                <h3 className="text-xl font-bold">{influencer.name}</h3>
                {influencer.niche && (
                  <Badge variant="secondary" className="text-xs mx-auto">
                    {influencer.niche}
                  </Badge>
                )}
                {influencer.location && (
                  <p className="text-sm text-gray-500">{influencer.location}</p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Bio */}
                {influencer.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{influencer.bio}</p>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-600 mr-1" />
                    </div>
                    <p className="font-semibold">{formatFollowers(influencer.followers_count || 0)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    </div>
                    <p className="font-semibold">{influencer.engagement_rate || 0}%</p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                </div>
                
                {/* Rating */}
                {influencer.rating && influencer.rating > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(influencer.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {influencer.rating} ({influencer.reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="flex justify-center space-x-3 mb-4">
                  {influencer.instagram_handle && (
                    <a 
                      href={`https://instagram.com/${influencer.instagram_handle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {influencer.youtube_handle && (
                    <a 
                      href={`https://youtube.com/@${influencer.youtube_handle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {influencer.facebook_handle && (
                    <a 
                      href={`https://facebook.com/${influencer.facebook_handle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                </div>
                
                {/* Tags */}
                {influencer.tags && influencer.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {influencer.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {influencer.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{influencer.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* CTA Button */}
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Connect with {influencer.name.split(' ')[0]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Influencers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInfluencers;
