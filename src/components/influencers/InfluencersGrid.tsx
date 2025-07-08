import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Users, TrendingUp, Instagram, Youtube, Facebook, Twitter, Linkedin, MapPin, Search, Filter, Crown, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Influencer } from '@/lib/csv/influencerTypes';

const InfluencersGrid: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchInfluencers();
  }, []);

  useEffect(() => {
    filterAndSortInfluencers();
  }, [influencers, searchTerm, selectedNiche, selectedLocation, sortBy]);

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('priority', { ascending: false })
        .order('followers_count', { ascending: false });

      if (error) {
        console.error('Error fetching influencers:', error);
        return;
      }

      setInfluencers(data || []);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInfluencers = () => {
    let filtered = [...influencers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(influencer =>
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Niche filter
    if (selectedNiche !== 'all') {
      filtered = filtered.filter(influencer => influencer.niche === selectedNiche);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(influencer => 
        influencer.location === selectedLocation || 
        influencer.city === selectedLocation ||
        influencer.state === selectedLocation
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'followers':
          return (b.followers_count || 0) - (a.followers_count || 0);
        case 'engagement':
          return (b.engagement_rate || 0) - (a.engagement_rate || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredInfluencers(filtered);
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

  const niches = [...new Set(influencers.map(i => i.niche).filter(Boolean))];
  const locations = [...new Set(influencers.map(i => i.location || i.city || i.state).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Discovering amazing influencers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Discover Influencers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with talented creators who can amplify your brand's message and engage your target audience
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Input
                type="text"
                placeholder="Search influencers, niches, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-0 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Niche Filter */}
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white">
                <SelectValue placeholder="Select Niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                {niches.map(niche => (
                  <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-0 bg-gray-50 focus:bg-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-bold text-purple-600">{filteredInfluencers.length}</span> influencers
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-0"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-0"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Influencers Grid */}
        <div className={`grid gap-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredInfluencers.map((influencer, index) => (
            <Card 
              key={influencer.id} 
              className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer border-0 bg-white/80 backdrop-blur-sm ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              style={{
                transform: `perspective(1000px) rotateX(${Math.sin(index * 0.2) * 1}deg) rotateY(${Math.cos(index * 0.3) * 1}deg)`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Featured badges */}
              <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
                {influencer.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {influencer.priority > 8 && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                    <Crown className="h-3 w-3 mr-1 fill-current" />
                    Top Creator
                  </Badge>
                )}
              </div>

              {/* Remove cover area entirely, everything in CardContent */}
              <CardContent className={`${viewMode === 'grid' ? 'pt-4' : 'pt-6'} pb-6 px-6 ${viewMode === 'list' ? 'flex-1' : 'text-center'} relative z-10`}>
                <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`text-xl font-bold group-hover:text-purple-600 transition-colors ${viewMode === 'list' ? 'text-left' : ''}`}>{influencer.name}</h3>
                      {influencer.featured && (
                        <Badge className="bg-yellow-400 text-yellow-900 border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className={`flex ${viewMode === 'list' ? 'justify-start space-x-4' : 'justify-center'} items-center mb-3`}>
                      {influencer.niche && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          {influencer.niche}
                        </Badge>
                      )}
                      {influencer.location && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {influencer.location}
                        </div>
                      )}
                    </div>
                    {viewMode === 'list' && influencer.bio && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{influencer.bio}</p>
                    )}
                    <div className={`grid ${viewMode === 'list' ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
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
                      {viewMode === 'list' && influencer.rating && (
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg transform transition-transform hover:scale-105">
                          <div className="flex items-center justify-center mb-1">
                            <Star className="h-4 w-4 text-yellow-600 mr-1" />
                          </div>
                          <p className="font-bold text-yellow-800">{influencer.rating}</p>
                          <p className="text-xs text-yellow-600">Rating</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={viewMode === 'list' ? 'ml-6' : ''}>
                    <div className={`flex ${viewMode === 'list' ? 'flex-col space-y-2' : 'justify-center space-x-2'} mb-4`}>
                      {[
                        { handle: influencer.instagram_handle, platform: 'instagram', color: 'text-pink-600 hover:text-pink-700', url: `https://instagram.com/${influencer.instagram_handle}` },
                        { handle: influencer.youtube_handle, platform: 'youtube', color: 'text-red-600 hover:text-red-700', url: `https://youtube.com/@${influencer.youtube_handle}` },
                        { handle: influencer.facebook_handle, platform: 'facebook', color: 'text-blue-600 hover:text-blue-700', url: `https://facebook.com/${influencer.facebook_handle}` },
                        { handle: influencer.twitter_handle, platform: 'twitter', color: 'text-blue-400 hover:text-blue-500', url: `https://twitter.com/${influencer.twitter_handle}` },
                        { handle: influencer.linkedin_handle, platform: 'linkedin', color: 'text-blue-700 hover:text-blue-800', url: `https://linkedin.com/in/${influencer.linkedin_handle}` },
                      ].filter(social => social.handle).slice(0, viewMode === 'list' ? 5 : 4).map((social, idx) => (
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
                    <Button 
                      className={`${viewMode === 'list' ? 'w-auto' : 'w-full'} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      {viewMode === 'list' ? 'Connect' : `Connect with ${influencer.name.split(' ')[0]}`}
                    </Button>
                  </div>
                </div>
                {viewMode === 'grid' && influencer.tags && influencer.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap justify-center gap-1">
                      {influencer.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/50">
                          {tag}
                        </Badge>
                      ))}
                      {influencer.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/50">
                          +{influencer.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="my-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-60"></div>
                {viewMode === 'grid' && influencer.bio && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2 text-center">{influencer.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No influencers found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedNiche('all');
                setSelectedLocation('all');
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencersGrid;
