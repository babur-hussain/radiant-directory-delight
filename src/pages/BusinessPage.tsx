import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, DollarSign, BarChart3, Search, Building2, Package, Wrench, Factory, ShoppingCart, Crown, Globe, Layers, CheckCircle, Phone, MapPin, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionPackagesLoading from '@/components/subscription/SubscriptionPackagesLoading';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';

const BusinessPage = () => {
  const [selectedSector, setSelectedSector] = useState<'influencer' | 'google' | null>(null);
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Filter packages to show only Business type
  const businessPackages = packages.filter(pkg => pkg.type === 'Business');

  const businessCategories = [
    { 
      icon: Package, 
      title: "Product-Based Business", 
      hindi: "उत्पाद आधारित व्यवसाय",
      description: "Physical products, retail, FMCG"
    },
    { 
      icon: Wrench, 
      title: "Service-Based Business", 
      hindi: "सेवा आधारित व्यवसाय",
      description: "Consulting, healthcare, education"
    },
    { 
      icon: Factory, 
      title: "Manufacturing Business", 
      hindi: "उत्पादन आधारित व्यवसाय",
      description: "Production, industrial, textile"
    },
    { 
      icon: ShoppingCart, 
      title: "Trading/Reselling Business", 
      hindi: "व्यापार/पुनः बिक्री व्यवसाय",
      description: "Wholesale, distribution, import/export"
    },
    { 
      icon: Crown, 
      title: "Franchise Business", 
      hindi: "फ्रेंचाइ़ आधारित व्यवसाय",
      description: "Franchise operations, licensed businesses"
    },
    { 
      icon: Globe, 
      title: "Online/Digital Business", 
      hindi: "ऑनलाइन आधारित व्यवसाय",
      description: "E-commerce, SaaS, digital services"
    },
    { 
      icon: Layers, 
      title: "Hybrid Business Model", 
      hindi: "संयुक्त/मिश्रित व्यवसाय मॉडल",
      description: "Combined online-offline operations"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      business: "Kumar Electronics",
      location: "Delhi",
      rating: 5,
      review: "Found perfect micro-influencers for our electronics store. Sales increased by 40% in just 2 months!",
      avatar: "/lovable-uploads/76f9acff-1106-4a0a-8ae3-29972438ab36.png"
    },
    {
      name: "Priya Sharma",
      business: "Sharma Fashion House",
      location: "Mumbai",
      rating: 5,
      review: "The platform helped us connect with fashion influencers who perfectly matched our brand. ROI was amazing!",
      avatar: "/lovable-uploads/b95dd1d1-6f76-42f3-a9cf-8d448b702150.png"
    },
    {
      name: "Amit Patel",
      business: "Patel Food Products",
      location: "Ahmedabad",
      rating: 5,
      review: "Budget control feature saved us thousands while still getting great results from food bloggers.",
      avatar: "/lovable-uploads/4cbcb3a6-c304-440a-b500-c1d16d70b1a1.png"
    },
    {
      name: "Sunita Gupta",
      business: "Gupta Beauty Salon",
      location: "Pune",
      rating: 5,
      review: "Dashboard monitoring helped us track every campaign. Best investment for our beauty business!",
      avatar: "/lovable-uploads/9b04922c-cd5c-4fa5-b632-190ceef7f974.png"
    }
  ];

  const googleListingTestimonials = [
    {
      name: "Gitesh Khandelwal",
      business: "Khandelwal Traders",
      location: "Jaipur",
      rating: 5,
      review: "Literally unexpected! Mind-blowing results, keep it up.",
      avatar: "/lovable-uploads/76f9acff-1106-4a0a-8ae3-29972438ab36.png"
    },
    {
      name: "Ritu Awasthi",
      business: "Ritu's Boutique",
      location: "Lucknow",
      rating: 5,
      review: "I listed my boutique and started getting calls within a week. Super effective!",
      avatar: "/lovable-uploads/b95dd1d1-6f76-42f3-a9cf-8d448b702150.png"
    },
    {
      name: "Ankit Sharma",
      business: "Sharma General Store",
      location: "Bhopal",
      rating: 5,
      review: "सच में गूगल लिस्टिंग से मेरी दुकान की बिक्री बहुत बढ़ गई। धन्यवाद!",
      avatar: "/lovable-uploads/4cbcb3a6-c304-440a-b500-c1d16d70b1a1.png"
    },
    {
      name: "Meera Reddy",
      business: "Reddy Sweets",
      location: "Hyderabad",
      rating: 5,
      review: "Now I'm doing good business! Getting leads daily from Google. Worth every rupee.",
      avatar: "/lovable-uploads/9b04922c-cd5c-4fa5-b632-190ceef7f974.png"
    },
    {
      name: "Vikram Singh",
      business: "Singh Auto Parts",
      location: "Chandigarh",
      rating: 5,
      review: "Google listing changed everything for my business. Getting customers from all over the city now!",
      avatar: "/lovable-uploads/0c2cba8d-5522-4895-938c-2c2e97bd317c.png"
    }
  ];

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setShowDialog(true);
  };

  if (selectedSector === 'influencer') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSector(null)}
              className="mb-6"
            >
              ← Back to Main Sectors
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Best influencer marketing solution is here now
              </h1>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Filtered Categorised Influencers</h3>
                    <p className="text-sm text-gray-600">Find the perfect influencers for your niche</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Budget Control</h3>
                    <p className="text-sm text-gray-600">Manage your marketing spend effectively</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Payment + Working Monitoring Dashboard</h3>
                    <p className="text-sm text-gray-600">Track performance and payments seamlessly</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg p-6 mb-12">
                <h2 className="text-xl md:text-2xl font-bold">
                  We connect 5 lakh+ influencers with 30K+ businesses<br />
                  <span className="text-yellow-300">(let's make the strongest network)</span>
                </h2>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                Find Influencer in One Click
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <category.icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <p className="text-sm text-orange-600 font-medium">{category.hindi}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                Success Stories from Our Business Partners
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                              <p className="text-sm text-gray-600">{testimonial.business}</p>
                              <p className="text-xs text-gray-500">{testimonial.location}</p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{testimonial.review}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Business Packages Only for Influencer Marketing */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                Choose Your Influencer Marketing Package
              </h2>
              
              {isLoading ? (
                <SubscriptionPackagesLoading />
              ) : isError ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">There was an error loading the packages.</p>
                  <Button onClick={() => window.location.reload()} type="button">Try Again</Button>
                </div>
              ) : (
                <SubscriptionPackages 
                  userRole="Business"
                  filterByType={true}
                  onSelectPackage={handleSelectPackage}
                />
              )}
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl">
                Start Your Influencer Campaign Now
              </Button>
            </div>
          </div>
        </div>
        <SubscriptionDialog 
          isOpen={showDialog}
          setIsOpen={setShowDialog}
          selectedPackage={selectedPackage}
        />
      </Layout>
    );
  }

  if (selectedSector === 'google') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSector(null)}
              className="mb-6"
            >
              ← Back to Main Sectors
            </Button>
            
            <div className="text-center mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                  <img 
                    src="/lovable-uploads/0c2cba8d-5522-4895-938c-2c2e97bd317c.png" 
                    alt="Sales Team"
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">Our Expert Sales Team</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <img 
                    src="/lovable-uploads/76f9acff-1106-4a0a-8ae3-29972438ab36.png" 
                    alt="Business Owner 1"
                    className="w-full h-30 object-cover rounded-lg"
                  />
                  <img 
                    src="/lovable-uploads/b95dd1d1-6f76-42f3-a9cf-8d448b702150.png" 
                    alt="Business Owner 2"
                    className="w-full h-30 object-cover rounded-lg"
                  />
                  <img 
                    src="/lovable-uploads/4cbcb3a6-c304-440a-b500-c1d16d70b1a1.png" 
                    alt="Business Owner 3"
                    className="w-full h-30 object-cover rounded-lg"
                  />
                  <img 
                    src="/lovable-uploads/9b04922c-cd5c-4fa5-b632-190ceef7f974.png" 
                    alt="Business Owner 4"
                    className="w-full h-30 object-cover rounded-lg"
                  />
                  <div className="col-span-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg flex items-center justify-center p-4">
                    <p className="text-sm font-medium text-center">
                      Indian Family Business Owners<br />
                      <span className="text-xs">Successfully Listed on Google</span>
                    </p>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                List your business on Google top only in <span className="text-green-600">₹999</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                This is no more expensive anymore
              </p>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  We've helped 25K+ businesses boost their sales through Google Listings
                </h2>
                <div className="flex items-center justify-center space-x-8 mt-4">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">25K+ Businesses</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">Top Rankings</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">Increased Sales</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                What Our Customers Say
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {googleListingTestimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                              <p className="text-sm text-gray-600">{testimonial.business}</p>
                              <p className="text-xs text-gray-500">{testimonial.location}</p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{testimonial.review}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Business Packages Only for Google Listing */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
                Google Listing Packages
              </h2>
              
              {isLoading ? (
                <SubscriptionPackagesLoading />
              ) : isError ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">There was an error loading the packages.</p>
                  <Button onClick={() => window.location.reload()} type="button">Try Again</Button>
                </div>
              ) : (
                <SubscriptionPackages 
                  userRole="Business"
                  filterByType={true}
                  onSelectPackage={handleSelectPackage}
                />
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">Ready to dominate local search results?</p>
              <Button variant="outline" size="lg" className="border-2 border-green-300 hover:bg-green-50">
                Talk to Our Google Listing Expert
              </Button>
            </div>
          </div>
        </div>
        <SubscriptionDialog 
          isOpen={showDialog}
          setIsOpen={setShowDialog}
          selectedPackage={selectedPackage}
        />
      </Layout>
    );
  }

  // Main Sectors View - Show Business packages only
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Grow as a <span className="text-gradient-purple">Business</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your path to business growth with our comprehensive solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
              onClick={() => setSelectedSector('influencer')}
            >
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                  Find Influencer
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Connect with 5 lakh+ influencers for your marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Categorised Influencers
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Budget Control
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Performance Dashboard
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl mt-6"
                    size="lg"
                  >
                    Explore Influencer Marketing →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
              onClick={() => setSelectedSector('google')}
            >
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                  Google Listing
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Get your business listed on Google and boost local visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Google My Business
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Local SEO
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Online Visibility
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl mt-6"
                    size="lg"
                  >
                    Get Google Listed →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Show Business packages only on main view */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Our Business Growth Packages
            </h2>
            
            {isLoading ? (
              <SubscriptionPackagesLoading />
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">There was an error loading the packages.</p>
                <Button onClick={() => window.location.reload()} type="button">Try Again</Button>
              </div>
            ) : (
              <SubscriptionPackages 
                userRole="Business"
                filterByType={true}
                onSelectPackage={handleSelectPackage}
              />
            )}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Ready to start growing your business?</p>
            <Button variant="outline" size="lg" className="border-2 border-purple-300 hover:bg-purple-50">
              Contact Our Business Experts
            </Button>
          </div>
        </div>
        <SubscriptionDialog 
          isOpen={showDialog}
          setIsOpen={setShowDialog}
          selectedPackage={selectedPackage}
        />
      </div>
    </Layout>
  );
};

export default BusinessPage;
