
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, TrendingUp, Instagram, Youtube, Facebook, Twitter, Linkedin, MapPin, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Influencer } from '@/lib/csv/influencerTypes';
import { useNavigate } from 'react-router-dom';

const TopInfluencers: React.FC = () => {
  const [topInfluencers, setTopInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopInfluencers();
  }, []);

  const fetchTopInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .or('featured.eq.true,priority.gte.5')
        .order('priority', { ascending: false })
        .order('followers_count', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching top influencers:', error);
        return;
      }

      setTopInfluencers(data || []);
    } catch (error) {
      console.error('Error fetching top influencers:', error);
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

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Top Influencers
            </h2>
            <div className="animate-pulse">Loading amazing creators...</div>
          </div>
        </div>
      </section>
    );
  }

  if (topInfluencers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Top Influencers
            </h2>
            <Crown className="h-8 w-8 text-yellow-500 ml-3" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover and connect with the most influential creators who are shaping trends and driving engagement across social platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {topInfluencers.map((influencer, index) => (
            <Card 
              key={influencer.id} 
              className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer border-0 bg-white/80 backdrop-blur-sm ${
                index < 2 ? 'lg:col-span-1 md:col-span-1' : ''
              }`}
              style={{
                transform: `perspective(1000px) rotateX(${Math.sin(index * 0.5) * 2}deg) rotateY(${Math.cos(index * 0.3) * 2}deg)`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Featured badge */}
              {influencer.featured && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Cover area with 3D effect */}
              <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden">
                {influencer.cover_image ? (
                  <img
                    src={influencer.cover_image}
                    alt={`${influencer.name}'s cover`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"></div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              {/* Profile image with 3D hover effect */}
              <div className="flex justify-center">
                <div className="relative -mt-12 z-10">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <img
                      src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=96&background=7c3aed&color=fff`}
                      alt={influencer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {influencer.priority > 8 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-yellow-800" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardContent className="pt-4 pb-6 px-6 text-center relative z-10">
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                  {influencer.name}
                </h3>
                
                {influencer.niche && (
                  <Badge variant="secondary" className="mb-3 bg-purple-100 text-purple-700 border-purple-200">
                    {influencer.niche}
                  </Badge>
                )}

                {influencer.location && (
                  <div className="flex items-center justify-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {influencer.location}
                  </div>
                )}
                
                {/* Stats with 3D cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg transform transition-transform hover:scale-105">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-600 mr-1" />
                    </div>
                    <p className="font-bold text-blue-800">{formatFollowers(influencer.followers_count || 0)}</p>
                    <p className="text-xs text-blue-600">Followers</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg transform transition-transform hover:scale-105">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    </div>
                    <p className="font-bold text-green-800">{influencer.engagement_rate || 0}%</p>
                    <p className="text-xs text-green-600">Engagement</p>
                  </div>
                </div>
                
                {/* Social links with hover effects */}
                <div className="flex justify-center space-x-2 mb-4">
                  {[
                    { handle: influencer.instagram_handle, platform: 'instagram', color: 'text-pink-600 hover:text-pink-700', url: `https://instagram.com/${influencer.instagram_handle}` },
                    { handle: influencer.youtube_handle, platform: 'youtube', color: 'text-red-600 hover:text-red-700', url: `https://youtube.com/@${influencer.youtube_handle}` },
                    { handle: influencer.facebook_handle, platform: 'facebook', color: 'text-blue-600 hover:text-blue-700', url: `https://facebook.com/${influencer.facebook_handle}` },
                    { handle: influencer.twitter_handle, platform: 'twitter', color: 'text-blue-400 hover:text-blue-500', url: `https://twitter.com/${influencer.twitter_handle}` },
                    { handle: influencer.linkedin_handle, platform: 'linkedin', color: 'text-blue-700 hover:text-blue-800', url: `https://linkedin.com/in/${influencer.linkedin_handle}` },
                  ].filter(social => social.handle).slice(0, 4).map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full bg-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
                
                {/* Rating */}
                {influencer.rating && influencer.rating > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(influencer.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {influencer.rating}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {influencer.tags && influencer.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap justify-center gap-1">
                      {influencer.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/50">
                          {tag}
                        </Badge>
                      ))}
                      {influencer.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-white/50">
                          +{influencer.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* CTA Button with 3D effect */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{
                    boxShadow: '0 10px 20px rgba(139, 69, 19, 0.3)',
                  }}
                >
                  Connect with {influencer.name.split(' ')[0]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button 
            onClick={() => navigate('/influencers')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Discover All Influencers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopInfluencers;
