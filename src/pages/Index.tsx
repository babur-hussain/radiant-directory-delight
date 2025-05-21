
import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
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

const Index = () => {
  return (
    <div className="index-page overflow-hidden">
      <HeroSection />
      <div className="py-4 sm:py-6 md:py-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 md:mb-4">Welcome to <span className="text-brand-orange">Grow Bharat Vyapaar</span></h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
          Discover and connect with Indian businesses from various sectors. Our platform helps 
          businesses grow and reach new customers through strategic influencer partnerships.
        </p>
      </div>
      <CtaSection />
      <CategorySection />
      <ServicesSection />
      <VideoReelsSection />
      <CollaborationsSection />
      <FeaturedBusinesses />
      <OnboardingGuide />
      <GoogleRankInfo />
      <PartnersSection />
      <BlogSection />
      <TestimonialSection />
      <CollaborationGuidelines />
      <CallToAction />
    </div>
  );
};

export default Index;
