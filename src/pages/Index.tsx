
import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';
import VideoReelsSection from '@/components/videos/VideoReelsSection';
import PartnersSection from '@/components/PartnersSection';

const Index = () => {
  return (
    <div className="index-page overflow-hidden">
      <HeroSection />
      <div className="py-4 sm:py-6 md:py-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 md:mb-4">Welcome to Grow Bharat Vyapaar</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
          Discover and connect with Indian businesses from various sectors. Our platform helps 
          businesses grow and reach new customers.
        </p>
      </div>
      <CtaSection />
      <CategorySection />
      <VideoReelsSection />
      <FeaturedBusinesses />
      <PartnersSection />
      <TestimonialSection />
      <CallToAction />
    </div>
  );
};

export default Index;
