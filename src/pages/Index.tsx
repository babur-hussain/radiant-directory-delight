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
import PhotoCollage from '@/components/PhotoCollage';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, BookOpen, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="index-page overflow-hidden">
      <HeroSection />
      
      <div className="py-4 sm:py-6 md:py-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 md:mb-4">Welcome to <span className="text-brand-orange">GROW BHARAT VYAPAAR</span></h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
          India's most innovative influencer-business matchmaking platform – empowering creators and local brands to grow together.
        </p>
      </div>
      
      <CtaSection />
      
      {/* Business Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              📈 Reach the Right Audience Through Trusted Local Influencers
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Find, connect, and collaborate with influencers based on location and category.
            </p>
            <Button 
              onClick={() => navigate('/businesses')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Register My Business <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Discovery</h3>
              <p className="text-gray-600">Find influencers near your business location</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Contact</h3>
              <p className="text-gray-600">Use virtual numbers to connect securely</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Lists</h3>
              <p className="text-gray-600">Get recommendations for just ₹399/month</p>
            </div>
          </div>
        </div>
      </section>
      
      <CategorySection />
      <ServicesSection />
      <VideoReelsSection />
      
      {/* Influencer Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              🎥 Be Seen. Be Paid. Be a Star.
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join for FREE, showcase your social power, and unlock earning opportunities from brands near you.
            </p>
            <Button 
              onClick={() => navigate('/influencers')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create My Influencer Profile <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-2">Basic</h3>
              <div className="text-3xl font-bold mb-1">₹299<span className="text-sm font-normal text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-4">200 KM radius visibility</p>
              <ul className="mb-4 space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Free profile creation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>6 video categories</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Local business connections</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-500 relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Popular
              </div>
              <h3 className="font-bold text-lg mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-1">₹499<span className="text-sm font-normal text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-4">450 KM radius visibility</p>
              <ul className="mb-4 space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>All Basic features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Higher exposure</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>More business connections</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-2">Premium</h3>
              <div className="text-3xl font-bold mb-1">₹799<span className="text-sm font-normal text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-4">1050 KM radius visibility</p>
              <ul className="mb-4 space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>All Pro features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Premium placement</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Maximum earning potential</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-xl">
              <p className="text-amber-700">
                <span className="font-bold">🎁 Special Offer:</span> Post a reel about GROW BHARAT VYAPAAR and get the ₹799 Premium plan FREE for 1 month!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <CollaborationsSection />
      <FeaturedBusinesses />
      <TopInfluencers />
      <OnboardingGuide />
      
      {/* Marketing Strategy Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How We Help You Grow</h2>
            <p className="text-lg text-gray-600">
              Our comprehensive growth strategies for both influencers and businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Targeted Marketing</h3>
              <p className="text-gray-600">Targeted ads on Instagram, Facebook & LinkedIn to reach the right audience</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🤝</div>
              <h3 className="text-lg font-semibold mb-2">Networking Events</h3>
              <p className="text-gray-600">Local influencer meet-ups & business networking events</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="text-lg font-semibold mb-2">Success Stories</h3>
              <p className="text-gray-600">Real success stories & influencer testimonials</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Search Visibility</h3>
              <p className="text-gray-600">Google Ads + SEO for organic reach</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Track influencer reach and campaign performance</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🎧</div>
              <h3 className="text-lg font-semibold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">Account support for premium influencers</p>
            </div>
          </div>
        </div>
      </section>
      
      <GoogleRankInfo />
      <PartnersSection />
      <BlogSection />
      <TestimonialSection />
      <CollaborationGuidelines />
      
      {/* Referral CTA */}
      <section className="py-12 bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Refer & Earn 20% Commission!</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Refer a business or influencer to our platform and earn 20% of their plan instantly!
          </p>
          <Button 
            variant="outline"
            size="lg"
            className="bg-white text-pink-600 hover:bg-white/90"
            onClick={() => navigate('/referral')}
          >
            Join Referral Program
          </Button>
        </div>
      </section>
      
      <PhotoCollage />
      <CallToAction />
    </div>
  );
};

export default Index;
