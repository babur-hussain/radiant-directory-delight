import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Users, TrendingUp, Instagram, Youtube, MapPin, Search, Filter, Crown, Heart, CheckCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Influencer {
  id: number;
  name: string;
  niche: string;
  location: string;
  followers_count: number;
  engagement_rate: number;
  rating: number;
  featured: boolean;
  priority: number;
  instagram_handle?: string;
  youtube_handle?: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  tags?: string[];
  reviews_count?: number;
  category?: string;
}

const categoryIcons = {
  'Entertainment & Comedy': '🎭',
  'Fashion & Lifestyle': '💃',
  'Gaming & Tech': '🕹️',
  'Food & Cooking': '🍽️',
  'Education & Finance': '📚',
  'Fitness & Health': '🏋️',
  'Music & Dance': '🎤'
};

const ModernInfluencersGrid: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('followers');
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [form, setForm] = useState({ name: '', profile_link: '', address: '', mobile: '', followers: '', category: '' });
  const [formStatus, setFormStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  useEffect(() => {
    filterAndSortInfluencers();
  }, [influencers, searchTerm, selectedCategory, selectedLocation, sortBy]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoScrollEnabled) {
      interval = setInterval(() => {
        const container = document.querySelector('.auto-scroll-container');
        if (container) {
          container.scrollBy({ left: 320, behavior: 'smooth' });
          if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoScrollEnabled]);

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

    if (searchTerm) {
      filtered = filtered.filter(influencer =>
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(influencer => influencer.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(influencer => 
        influencer.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return (b.followers_count || 0) - (a.followers_count || 0);
        case 'engagement':
          return (b.engagement_rate || 0) - (a.engagement_rate || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return (b.priority || 0) - (a.priority || 0);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitInfluencerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    try {
      const { error } = await supabase.from('influencer_applications').insert([{
        name: form.name,
        profile_link: form.profile_link,
        location: form.address,
        phone: form.mobile,
        followers_count: Number(form.followers),
        category: form.category,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setFormStatus({ success: true, message: 'Your profile has been submitted successfully.' });
      setForm({ name: '', profile_link: '', address: '', mobile: '', followers: '', category: '' });
      setTimeout(() => {
        setDialogOpen(false);
        setFormStatus(null);
      }, 4000);
    } catch (err) {
      setFormStatus({ success: false, message: 'Submission failed. Please try again.' });
    }
  };

  const categories = [...new Set(influencers.map(i => i.category).filter(Boolean))];
  const locations = [...new Set(influencers.map(i => i.location?.split(',')[0]).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-l-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discovering Amazing Creators
          </h3>
          <p className="text-slate-600 mt-2">Finding the perfect influencers for you...</p>
        </div>
      </div>
    );
  }

  const featuredInfluencers = filteredInfluencers.filter(inf => inf.featured);
  const groupedByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredInfluencers.filter(inf => inf.category === category);
    return acc;
  }, {} as Record<string, Influencer[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Become a Verified
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Influencer
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Start Earning Through Local Brand Collaborations
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Badge className="bg-yellow-400 text-yellow-900 text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                {influencers.length}+ Verified Creators
              </Badge>
              <Badge className="bg-green-400 text-green-900 text-lg px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Pan-India Coverage
              </Badge>
              <Badge className="bg-purple-400 text-purple-900 text-lg px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                High Engagement
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Influencer Listing Section - Redesigned */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Form Column */}
            <div className="w-full lg:w-1/2 bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-blue-100">
              <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">Get Listed as an Influencer</h2>
              <p className="text-lg text-gray-600 mb-6 text-center">Join our network and connect with top brands. Submit your profile to get discovered!</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg mb-4"
                    onClick={() => setDialogOpen(true)}
                  >
                    Get Listed Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full p-0 bg-transparent border-0 shadow-none">
                  <div className="relative bg-white rounded-2xl shadow-2xl border-0 overflow-hidden max-h-[90vh] w-full flex flex-col" style={{ boxShadow: '0 8px 32px 0 rgba(99,102,241,0.15)' }}>
                    {/* Gradient Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-blue-400 to-pink-400" />
                    <div className="p-8 overflow-y-auto flex-1">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Influencer Listing Form</DialogTitle>
                        <DialogDescription>Fill out your details to join our platform.</DialogDescription>
                      </DialogHeader>
                      <form className="space-y-5 mt-2" onSubmit={handleSubmitInfluencerForm}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input type="text" name="name" value={form.name} onChange={handleFormChange} required placeholder="e.g. Priya Sharma" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Social Profile Link</label>
                          <input type="url" name="profile_link" value={form.profile_link} onChange={handleFormChange} required placeholder="e.g. https://instagram.com/yourprofile" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City & State</label>
                          <input type="text" name="address" value={form.address} onChange={handleFormChange} required placeholder="e.g. Mumbai, Maharashtra" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                          <input type="tel" name="mobile" value={form.mobile} onChange={handleFormChange} required placeholder="e.g. 9876543210" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Follower Count</label>
                          <input type="number" name="followers" value={form.followers} onChange={handleFormChange} required placeholder="e.g. 12000" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
                          <input type="text" name="category" value={form.category} onChange={handleFormChange} required placeholder="e.g. Fashion, Tech, Food" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold py-2 rounded-lg">Submit</Button>
                        </DialogFooter>
                        {formStatus && (
                          <div className={`flex items-center justify-center gap-2 text-center text-sm mt-2 ${formStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                            {formStatus.success ? <span>✅</span> : <span>⚠️</span>}
                            {formStatus.message}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Cards Column */}
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {filteredInfluencers.slice(0, 4).map((influencer, index) => (
                  <Card key={influencer.id} className="group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer border-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
                    <CardContent className="pt-6 pb-6 px-6 text-center relative z-10">
                      <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors mb-2">{influencer.name}</h3>
                      <div className="flex justify-center items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">{influencer.niche}</Badge>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {influencer.location}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <p className="font-bold text-blue-800">{formatFollowers(influencer.followers_count || 0)}</p>
                          <p className="text-xs text-blue-600">Followers</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                          <p className="font-bold text-green-800">{influencer.engagement_rate || 0}%</p>
                          <p className="text-xs text-green-600">Engagement</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full mt-2">View Profile</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-12 border border-white/20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search creators, niches, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white transition-all duration-300 text-lg"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 border-0 bg-gray-50 focus:bg-white text-lg">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {categoryIcons[category as keyof typeof categoryIcons]} {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12 border-0 bg-gray-50 focus:bg-white text-lg">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 border-0 bg-gray-50 focus:bg-white text-lg">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-gray-600 text-lg">
              Found <span className="font-bold text-blue-600">{filteredInfluencers.length}</span> amazing creators
            </p>
            <Button
              variant={autoScrollEnabled ? "default" : "outline"}
              onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Auto Scroll: {autoScrollEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Featured Creators Auto-Scroll Section */}
        {featuredInfluencers.length > 0 && (
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-4 mb-8">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Featured Creators
              </h2>
            </div>
            
            <div 
              className="auto-scroll-container flex gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseEnter={() => setAutoScrollEnabled(false)}
              onMouseLeave={() => setAutoScrollEnabled(true)}
            >
              {[...featuredInfluencers, ...featuredInfluencers].map((influencer, index) => (
                <Card 
                  key={`${influencer.id}-${index}`}
                  className="flex-shrink-0 w-80 group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors">
                        {influencer.name}
                      </h3>
                      {influencer.featured && (
                        <Badge className="bg-yellow-400 text-yellow-900 border-0">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {influencer.niche}
                      </Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {influencer.location?.split(',')[0]}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center">
                        <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="font-bold text-blue-800">{formatFollowers(influencer.followers_count)}</p>
                        <p className="text-xs text-blue-600">Followers</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center">
                        <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <p className="font-bold text-green-800">{influencer.engagement_rate}%</p>
                        <p className="text-xs text-green-600">Engagement</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {influencer.instagram_handle && (
                          <a href={`https://instagram.com/${influencer.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {influencer.youtube_handle && (
                          <a href={`https://youtube.com/@${influencer.youtube_handle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                            <Youtube className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Connect
                      </Button>
                    </div>
                    <div className="my-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-60"></div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2 text-center">
                      {influencer.bio}
                    </p>
                    {influencer.tags && influencer.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {influencer.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs bg-white/50">
                            {tag}
                          </Badge>
                        ))}
                        {influencer.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-white/50">
                            +{influencer.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category-wise Sections */}
        {Object.entries(groupedByCategory).map(([category, categoryInfluencers], categoryIndex) => (
          categoryInfluencers.length > 0 && (
            <div key={category} className="mb-16 animate-fade-in" style={{ animationDelay: `${1.0 + categoryIndex * 0.2}s` }}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <h2 className="text-4xl font-bold text-gray-800">{category}</h2>
                <Badge className="bg-gray-100 text-gray-600 text-lg px-3 py-1">
                  {categoryInfluencers.length} creators
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {categoryInfluencers.map((influencer, index) => (
                  <Card 
                    key={influencer.id}
                    className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 border-0 bg-white/90 backdrop-blur-sm overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${1.2 + categoryIndex * 0.2 + index * 0.1}s` }}
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                          {influencer.name}
                        </h3>
                        {influencer.featured && (
                          <Badge className="bg-yellow-400 text-yellow-900 border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {influencer.niche}
                        </Badge>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {influencer.location?.split(',')[0]}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center">
                          <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                          <p className="font-bold text-blue-800 text-sm">{formatFollowers(influencer.followers_count)}</p>
                          <p className="text-xs text-blue-600">Followers</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center">
                          <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                          <p className="font-bold text-green-800 text-sm">{influencer.engagement_rate}%</p>
                          <p className="text-xs text-green-600">Engagement</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {influencer.instagram_handle && (
                            <a href={`https://instagram.com/${influencer.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors">
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {influencer.youtube_handle && (
                            <a href={`https://youtube.com/@${influencer.youtube_handle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                              <Youtube className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105">
                          Connect
                        </Button>
                      </div>
                      <div className="my-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-60"></div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {influencer.bio}
                      </p>
                      {influencer.tags && influencer.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {influencer.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs bg-white/50">
                              {tag}
                            </Badge>
                          ))}
                          {influencer.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-white/50">
                              +{influencer.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Empty State */}
        {filteredInfluencers.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="mb-8">
              <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-600 mb-4">No creators found</h3>
              <p className="text-gray-500 text-lg mb-8">Try adjusting your search criteria or explore different categories</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernInfluencersGrid;
