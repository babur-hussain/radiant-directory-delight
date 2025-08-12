import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import FeaturedInfluencers from '@/components/FeaturedInfluencers';
import TopInfluencers from '@/components/TopInfluencers';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';
import VideoReelsSection from '@/components/videos/VideoReelsSection';
import PartnersSection from '@/components/PartnersSection';
import BlogSection from '@/components/blog/BlogSection';
import ServicesSection from '@/components/services/ServicesSection';
import CollaborationsSection from '@/components/collaborations/CollaborationsSection';
import GoogleRankInfo from '@/components/seo/GoogleRankInfo';
import OnboardingGuide from '@/components/influencer/OnboardingGuide';
import CollaborationGuidelines from '@/components/brand/CollaborationGuidelines';
import CollageFromStorage from '@/components/CollageFromStorage';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, BookOpen, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const { packages, isLoading, isError } = useSubscriptionPackages();
  
  // Filter packages to show only Influencer type for the home page display
  const influencerPackages = packages.filter(pkg => pkg.type === 'Influencer').slice(0, 3);
  
  return (
    <div className="index-page overflow-hidden">
      <HeroSection />
      
      {/* Welcome Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Welcome to <span className="text-brand-orange">GROW BHARAT VYAPAAR</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
              India's most innovative influencer-business matchmaking platform – empowering creators and local brands to grow together.
            </p>
          </div>
        </div>
      </section>
      
      <CtaSection />
      
      {/* Business Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              📈 Reach the Right Audience Through Trusted Local Influencers
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Find, connect, and collaborate with influencers based on location and category.
            </p>
            <Button 
              onClick={() => navigate('/businesses')} 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out text-sm sm:text-base px-8 py-3 rounded-xl font-semibold border-0"
            >
              Register My Business <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Local Discovery</h3>
              <p className="text-gray-600 text-sm sm:text-base">Find influencers near your business location</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Contact</h3>
              <p className="text-gray-600 text-sm sm:text-base">Use virtual numbers to connect securely</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Curated Lists</h3>
              <p className="text-gray-600 text-sm sm:text-base">Get recommendations for just ₹399/month</p>
            </div>
          </div>
        </div>
      </section>
      
      <CategorySection />
      <ServicesSection />
      <VideoReelsSection />
      
      {/* Influencer Section with Live Packages */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              🎥 Be Seen. Be Paid. Be a Star.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Join for FREE, showcase your social power, and unlock earning opportunities from brands near you.
            </p>
            <Button 
              onClick={() => navigate('/influencers')} 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out text-sm sm:text-base px-8 py-3 rounded-xl font-semibold border-0"
            >
              Create My Influencer Profile <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : isError ? (
              // Error state
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8">
                <p className="text-gray-600 mb-4">Unable to load packages at the moment</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : influencerPackages.length > 0 ? (
              // Live packages from Supabase
              influencerPackages.map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
                    pkg.popular ? 'border-2 border-purple-500 relative' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-4 sm:right-6 transform -translate-y-1/2 bg-purple-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      Popular
                    </div>
                  )}
                  <h3 className="font-bold text-base sm:text-lg mb-2">{pkg.title}</h3>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    ₹{(pkg.billingCycle === 'monthly' ? (pkg.monthlyPrice || pkg.price) : pkg.price).toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-500">
                      {pkg.paymentType === 'one-time' ? '' : (
                        (pkg.durationMonths || (pkg.billingCycle === 'yearly' ? 12 : 1)) === 1
                          ? '/month'
                          : (pkg.durationMonths || 12) === 12
                            ? '/year'
                            : `/${pkg.durationMonths} months`
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{pkg.shortDescription}</p>
                  <ul className="mb-4 space-y-2 text-sm sm:text-base">
                    {pkg.features.slice(0, 3).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              // Fallback when no packages are available
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8">
                <p className="text-gray-600">No packages available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <CollaborationsSection />
      <FeaturedBusinesses />
      <TopInfluencers />
      <OnboardingGuide />
      
      {/* Marketing Strategy Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">How We Help You Grow</h2>
            <p className="text-base sm:text-lg text-gray-600">
              Our comprehensive growth strategies for both influencers and businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { icon: "🎯", title: "Targeted Marketing", desc: "Targeted ads on Instagram, Facebook & LinkedIn to reach the right audience" },
              { icon: "🤝", title: "Networking Events", desc: "Local influencer meet-ups & business networking events" },
              { icon: "💬", title: "Success Stories", desc: "Real success stories & influencer testimonials" },
              { icon: "🔍", title: "Search Visibility", desc: "Google Ads + SEO for organic reach" },
              { icon: "📊", title: "Analytics Dashboard", desc: "Track influencer reach and campaign performance" },
              { icon: "🎧", title: "Dedicated Support", desc: "Account support for premium influencers" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                <div className="text-xl sm:text-2xl mb-2 sm:mb-3">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <GoogleRankInfo />
      <PartnersSection />
      <BlogSection />
      <TestimonialSection />
      <CollaborationGuidelines />
      
      {/* Referral CTA */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Refer & Earn 20% Commission!
          </h2>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto">
            Refer a business or influencer to our platform and earn 20% of their plan instantly!
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white hover:text-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out text-sm sm:text-base px-8 py-3 rounded-xl font-semibold" 
            onClick={() => navigate('/referral')}
          >
            Join Referral Program
          </Button>
        </div>
      </section>
      
      <CollageFromStorage />
      <CallToAction />
    </div>
  );
};

export default Index;
