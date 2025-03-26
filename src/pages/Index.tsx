
import React from 'react';
import Layout from '@/components/layout/Layout';
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
    <Layout>
      <div className="index-page">
        <HeroSection />
        <div className="py-6 md:py-8">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-3 md:mb-4">Welcome to Grow Bharat Vyapaar</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto px-4">
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
    </Layout>
  );
};

export default Index;
